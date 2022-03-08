import * as net from 'net';
import { EventEmitter } from 'events';
import * as prettyMilliseconds from 'pretty-ms';

const sizeLength = 4;
const sizeInvalid = -1;

export type BufferedSocketOptions = {
    maxPacketSize?: { value: number, onExcept: (packetSize: number) => void },
}
export const defaultBufferedSocketOptions: BufferedSocketOptions = {
    maxPacketSize: { value: 0, onExcept: () => { } }
}

export declare interface IBufferedSocket {
    on(event: 'connect', listener: () => void): this;
    on(event: 'data', listener: (data: Buffer) => void): this;
    on(event: 'buffered_data', listener: (data: Buffer) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'close', listener: (hadError: boolean) => void): this;
}

export class BufferedSocket extends EventEmitter {
    private createdAt = new Date().getTime();
    private packetStat = {
        inPackets: 0,
        outPackets: 0,
    }
    private socket: net.Socket;

    private receiveBuffer = Buffer.alloc(0);
    private receiveSize = sizeInvalid;

    private sendBuffer: Buffer[] = [];
    private drained = true;

    private bufferFrom(source: Buffer, start: number, length = sizeInvalid): Buffer {
        if (length < 0)
            length = source.length - start;
        const result = Buffer.allocUnsafe(length);
        result.set(source.subarray(start, start + length));
        return result;
    }

    constructor(socket: net.Socket, options: BufferedSocketOptions = defaultBufferedSocketOptions) {
        super();

        this.socket = socket;

        socket.on('connect', () => {
            this.receiveBuffer = Buffer.allocUnsafe(0);
            this.receiveSize = -1;
            this.emit('connect')
        });
        socket.on('data', (data: Buffer) => {
            this.receiveBuffer = Buffer.concat([this.receiveBuffer, data]);
            this.processReceiveBuffer(options);
        });
        socket.on('end', () => {
            socket.emit('data', Buffer.allocUnsafe(0));
            this.emit('end');
        });
        socket.on('drain', () => {
            this.drained = true;
            this.processSendBuffer();
        })
        socket.on('close', (hadError: boolean) => this.emit('close', hadError));
        socket.on('error', () => { });
    }

    private processReceiveBuffer(options: BufferedSocketOptions) {
        if (this.receiveSize < 0) {
            if (this.receiveBuffer.length >= sizeLength) {
                this.receiveSize = this.receiveBuffer.readUInt32LE(0);
                this.receiveBuffer = this.bufferFrom(this.receiveBuffer, sizeLength);
            }
        }
        if (this.receiveSize >= 0)
            if (this.receiveBuffer.length >= this.receiveSize) {
                const sizeToCheck = this.receiveSize;
                const msg = this.bufferFrom(this.receiveBuffer, 0, this.receiveSize);
                this.receiveBuffer = this.bufferFrom(this.receiveBuffer, this.receiveSize);
                this.receiveSize = -1;
                if (options.maxPacketSize && options.maxPacketSize.value > 0 && sizeToCheck > options.maxPacketSize.value)
                    options.maxPacketSize.onExcept(sizeToCheck);
                else {
                    this.emit('buffered_data', msg);
                    this.packetStat.inPackets++;
                }
                this.processReceiveBuffer(options);
            }
    }

    protected setKeepAlive(enable: boolean, initialDelay: number) { this.socket.setKeepAlive(enable, initialDelay); }

    protected connect(port: number, host: string) { this.socket.connect(port, host); }

    private dataBufferToTranferBuffer(data: Buffer) {
        const lengthBuffer = Buffer.allocUnsafe(sizeLength);
        lengthBuffer.writeUInt32LE(data.length);

        return Buffer.concat([lengthBuffer, data]);
    }

    private addToSendBuffer(buffer: Buffer) {
        this.sendBuffer.push(buffer);
        this.packetStat.outPackets++;
        this.processSendBuffer();
    }
    private processSendBuffer() {
        if (!this.drained)
            return;
        const buffer = this.sendBuffer.shift();
        if (buffer)
            if (!this.socket.write(buffer))
                this.drained = false;
    }

    protected send(data: Buffer) { this.addToSendBuffer(this.dataBufferToTranferBuffer(data)); }

    protected destroy(error?: Error) { this.socket.destroy(error); }

    public getSocketAddressInfo() {
        return {
            address: this.socket.remoteAddress,
            addressFamily: this.socket.remoteFamily,
            port: this.socket.remotePort,
        }
    }

    public getSocketStat() {
        return {
            ageMs: new Date().getTime() - this.createdAt,
            ageHuman: prettyMilliseconds(new Date().getTime() - this.createdAt, { compact: true }),
            inBytes: this.socket.bytesRead,
            outBytes: this.socket.bytesWritten,
            inPackets: this.packetStat.inPackets,
            outPackets: this.packetStat.outPackets,
        }
    }
}
