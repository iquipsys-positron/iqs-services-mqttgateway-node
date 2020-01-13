import { IStream } from 'iqs-libs-protocols-node';
import { Message } from './Message';
export declare class StateUpdateMessage extends Message {
    data_version: number;
    freezed: boolean;
    pressed: boolean;
    long_pressed: boolean;
    power: boolean;
    lat: number;
    lng: number;
    alt: number;
    angle: number;
    speed: number;
    quality: number;
    beacons: string[];
    constructor();
    stream(stream: IStream): void;
}
