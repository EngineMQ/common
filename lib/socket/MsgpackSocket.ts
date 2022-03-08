import * as net from 'net';
import { BufferedSocket, BufferedSocketOptions, defaultBufferedSocketOptions } from './BufferedSocket';
import { Packr } from 'msgpackr';

const packr = new Packr();

export declare interface MsgpackSocket {
    on(event: 'connect', listener: () => void): this;
    on(event: 'data', listener: (data: Buffer) => void): this;
    on(event: 'buffered_data', listener: (data: Buffer) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'close', listener: (hadError: boolean) => void): this;

    on(event: 'obj_data', listener: (obj: object) => void): this;
}
export class MsgpackSocket extends BufferedSocket {
    constructor(socket: net.Socket, options: BufferedSocketOptions = defaultBufferedSocketOptions) {
        super(socket, options);

        this.on('buffered_data', (data: Buffer) => {
            this.emit('obj_data', packr.unpack(data));
        });
    }

    sendObj(obj: any) { super.send(packr.pack(obj || {})); }
}