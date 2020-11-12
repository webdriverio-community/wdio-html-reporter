import { readFileSync } from 'fs';

export default function encode(url) {
    const fileBuf = readFileSync(url);
    return "data:image/png;base64,"  + fileBuf.toString('base64');
}