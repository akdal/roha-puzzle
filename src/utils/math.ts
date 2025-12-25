import { Vector3, Quaternion } from 'three';

export type Axis = 'x' | 'y' | 'z';

export const rotateVector = (vec: [number, number, number], axis: Axis, direction: 1 | -1): [number, number, number] => {
    const [x, y, z] = vec;
    // 90 degree rotations
    if (axis === 'x') {
        // x stays, y,z rotate. Clockwise around X: y->z, z->-y
        // Direction 1 = clockwise? Standard right hand rule:
        // Thumb X+, fingers Y+ -> Z+.
        // A rotation of +90 (1) transforms (0,1,0) to (0,0,1).
        // So y' = -z*sin + y*cos?
        // +90 deg: y -> -z, z -> y (Wait, standard is (y,z) -> (-z, y))

        // Let's stick to standard math:
        // Rot X(90): [1 0 0; 0 0 -1; 0 1 0]
        // y' = -z, z' = y

        if (direction === 1) return [x, -z, y];
        else return [x, z, -y];
    }
    if (axis === 'y') {
        // Rot Y(90): [0 0 1; 0 1 0; -1 0 0]
        // x' = z, z' = -x
        if (direction === 1) return [z, y, -x];
        else return [-z, y, x];
    }
    if (axis === 'z') {
        // Rot Z(90): [0 -1 0; 1 0 0; 0 0 1]
        // x' = -y, y' = x
        if (direction === 1) return [-y, x, z];
        else return [y, -x, z];
    }
    return vec;
}

export const rotateQuaternion = (quat: [number, number, number, number], axis: Axis, direction: 1 | -1): [number, number, number, number] => {
    const q = new Quaternion(...quat);
    const rotAxis = new Vector3(
        axis === 'x' ? 1 : 0,
        axis === 'y' ? 1 : 0,
        axis === 'z' ? 1 : 0
    );
    // Standard math: angle is PI/2 * direction
    const angle = (Math.PI / 2) * direction;
    const rotQ = new Quaternion().setFromAxisAngle(rotAxis, angle);

    q.premultiply(rotQ); // Apply rotation in world space? Or local?
    // If we rotate the cube layer, the cubies rotate around the world axis. 
    // So premultiply is correct for extrinsic rotation (global axis).

    return [q.x, q.y, q.z, q.w];
}
