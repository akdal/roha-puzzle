import { useRef } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { Vector3, Vector2 } from 'three';
import { useStore } from '../store/useStore';
import type { Axis } from '../utils/math';

export const useCubeInteraction = () => {
    const { triggerRotation, animation } = useStore();

    // Ref to store drag state
    const dragRef = useRef<{
        startPos: Vector2;
        active: boolean;
        cubiePos: Vector3;
        normal: Vector3;
    } | null>(null);

    const onPointerDown = (e: ThreeEvent<PointerEvent>, cubiePos: [number, number, number]) => {
        // Stop camera rotation
        e.stopPropagation();
        if (animation.isAnimating) return;

        // e.face.normal gives the normal in local or world space?
        // R3F/Three raycast returns world normal if the object has world transforms?
        // RoundedBox might be tricky with normals.
        // However, since we align cubies to axes, normals should be roughly unit vectors.

        if (!e.face) return;

        // We need the normal to know which face we clicked.
        // The normal rotates with the cube!
        // So we use the point of intersection or the normal from the event.
        // Let's assume the normal is correct world normal.
        // We also need the 2D screen coordinate for drag direction?
        // OR easier: project drag onto the surface?
        // Let's use screen space drag for simplicity of gesture.

        dragRef.current = {
            startPos: new Vector2(e.clientX, e.clientY),
            active: true,
            cubiePos: new Vector3(...cubiePos),
            normal: e.face.normal.clone().normalize()
        };

        // Capture pointer?
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
        // e.stopPropagation(); // Usually good
        if (dragRef.current) {
            dragRef.current = null;
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        }
    };

    const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
        // e.stopPropagation();
        if (!dragRef.current || !dragRef.current.active || animation.isAnimating) return;

        const { startPos, normal, cubiePos } = dragRef.current;

        const currentPos = new Vector2(e.clientX, e.clientY);
        const delta = currentPos.clone().sub(startPos);

        // Threshold for drag
        const minDrag = 30; // pixels
        if (delta.length() < minDrag) return;

        // Determine rotation
        // We need to map screen delta (dx, dy) to 3D world axes based on the face normal.
        // Case 1: Clicked Right Face (Normal X+)
        // Drag Up (Screen -Y) -> Should rotate around Z axis? Or Y axis?
        // Drag Up on Right Face -> Rotate layer around Z axis.
        // Drag Right on Right Face -> Rotate layer around Y axis.

        // This mapping depends on Camera angle too... which makes it hard.
        // BETTER APPROACH: Raycast plane intersection.
        // But Screen Space direction is intuitive only if aligned.

        // Alternative: Project the "intended" 3D movement vectors to screen space and compare with drag.

        // Let's try heuristic:
        // 1. Get Camera direction.
        // 2. We have 2 possible orthogonal axes on the face plane.
        //    e.g. Normal X. Moving axes are Y and Z.
        // 3. Project "Unit Y" and "Unit Z" (at click point) to Screen Space.
        // 4. Dot product with Drag Vector to find which matches best.

        // We need `camera` from state? `useThree` hook inside component can pass it?
        // Or just pass `e.camera` (it's in the event).

        const cam = e.camera;

        // Determine the two possible motion axes based on normal
        let axes: { axis: Axis, dir: Vector3 }[] = [];

        const nx = Math.abs(normal.x);
        const ny = Math.abs(normal.y);
        const nz = Math.abs(normal.z);

        // Find dominant normal axis
        if (nx > ny && nx > nz) { // X face
            axes = [
                { axis: 'y', dir: new Vector3(0, 1, 0) },
                { axis: 'z', dir: new Vector3(0, 0, 1) }
            ];
        } else if (ny > nx && ny > nz) { // Y face
            axes = [
                { axis: 'x', dir: new Vector3(1, 0, 0) },
                { axis: 'z', dir: new Vector3(0, 0, 1) }
            ];
        } else { // Z face
            axes = [
                { axis: 'x', dir: new Vector3(1, 0, 0) },
                { axis: 'y', dir: new Vector3(0, 1, 0) }
            ];
        }

        // Project intersection point + axis to screen
        // p0 = intersection point (we don't have exact point stored, but cubie center is close enough for direction)
        // Actually e.point is available in interaction, but we didn't store it.
        // Let's use cubiePos.
        const p0 = cubiePos.clone().project(cam);

        let bestMatch = null;
        let maxDot = 0;

        for (const ax of axes) {
            // Point displaced by axis check
            const p1 = cubiePos.clone().add(ax.dir).project(cam);
            const screenDir = new Vector2(p1.x - p0.x, p1.y - p0.y).normalize();
            // Y is inverted in CSS check vs WebGL usually?
            // clientY is Top-Down. WebGL Y is Bottom-Up.
            // delta is in client pixels (Top-Down).
            // project() returns Normalized Device Coords (-1 to 1), Y Up.
            // So screenDir.y should be inverted to match client axis?
            // Wait, delta.y (down) is positive.
            // p1.y (up) is positive.
            // So if I drag UP, delta.y is negative. p1.y increases.
            // So signs are opposite.

            const dragDir = delta.clone().normalize();
            // Adjust p1.y for screen space direction (flip Y)
            const visualDir = new Vector2(screenDir.x, -screenDir.y).normalize();

            const dot = Math.abs(visualDir.dot(dragDir));
            if (dot > maxDot) {
                maxDot = dot;

                // Determine +/- direction
                // Dot product of signed vectors
                const signedDot = visualDir.dot(dragDir);
                bestMatch = {
                    axis: ax.axis,
                    // direction logic:
                    // If we drag along visualDir, we are moving in +Axis direction.
                    // Trigger rotation is (axis, layer, dir).
                    // We need to verify the "Right Hand Rule" rotation for the layer.
                    // Simple Rotation:
                    // Moving a slice in +X direction -> Rotate around Y or Z?
                    // No, moving a face.
                    // e.g. Front face (Z+).
                    // Drag Right (+X). This rotates the whole cube around Y axis.
                    // Layer Rotation Axis: Y.
                    // Direction: -1 (Clockwise from top) or 1?
                    // In our math, rotateLayer(axis, layer, dir).
                    // If I push the front face right, I expect it to move right.
                    // That is a rotation around Y Axis.
                    // As seen from Top (Y+), dragging Front Face right is Clockwise (-1).
                    // Standard: (z, x) -> (-x, z)? No.
                    // Let's simplify: 
                    // Match the `dir` 1/-1 by trial or logic.
                    // dragDir aligned with visualDir (+Axis direction).
                    // e.g. X axis on Front Face. +X movement.
                    // This corresponds to Rotation around Y.
                    // Rotation Y + direction (1) moves Z->X? 
                    // rotY(1): z -> -x? No.
                    // Let's rely on standard:
                    // Move +U (horizontal) on F face -> Rot -Y.
                    // Move +R (vertical) on F face -> Rot +X.

                    // Let's deduce cross product?
                    // Rotation Axis = Cross(Normal, MovementAxis).
                    // Dir = sign of that?

                    rotationAxis: ax.axis === 'x' ? 'y' : (ax.axis === 'y' ? 'z' : 'x'), // This is wrong.
                    // Logic:
                    // Normal: Z (Front)
                    // Move: X. Rotation Axis: Y.
                    // Move: Y. Rotation Axis: X.

                    // Normal: X (Right)
                    // Move: Y. Rotation Axis: Z.
                    // Move: Z. Rotation Axis: Y.

                    // Cross Product logic holds: Axis = Cross(MoveDir, Normal).

                    visualDir: visualDir,
                    dragDot: signedDot
                };
            }
        }

        if (bestMatch && maxDot > 0.5) { // Threshold for existing
            // Calculate rotation params
            // We need Rotation Axis and Direction.
            // Axis is determined by the OTHER axis on the face.
            // e.g. on Z face, moving X involves rotating around Y.
            // On Z face, moving Y involves rotating around X.

            const moveAxis = bestMatch.axis;
            let rotAxis: Axis;

            // Find the third axis
            if ((normal.x && moveAxis === 'y') || (normal.y && moveAxis === 'x')) rotAxis = 'z';
            else if ((normal.x && moveAxis === 'z') || (normal.z && moveAxis === 'x')) rotAxis = 'y';
            else rotAxis = 'x';

            // Direction?
            // Cross product of MoveDir(3D) x Normal(3D) = RotationAxisVector.
            // Check if RotationAxisVector is + or - along the rotAxis.

            const moveDir3D = axes.find(a => a.axis === moveAxis)!.dir.clone(); // +direction
            if (bestMatch.dragDot < 0) moveDir3D.negate(); // User dragged opposite way

            const cross = new Vector3().crossVectors(moveDir3D, normal); // Drag x Normal

            // Project cross onto rotAxis
            const rotVal = rotAxis === 'x' ? cross.x : rotAxis === 'y' ? cross.y : cross.z;
            const rotDir = rotVal > 0 ? 1 : -1;

            // Trigger
            // We interact with a specific layer.
            // The layer index is determined by the cubie transform.
            const layer = Math.round(rotAxis === 'x' ? cubiePos.x : rotAxis === 'y' ? cubiePos.y : cubiePos.z);

            triggerRotation(rotAxis, layer, rotDir as 1 | -1);

            // Reset drag to avoid multi-trigger
            dragRef.current = null;
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        }

    };

    return { onPointerDown, onPointerMove, onPointerUp };
};
