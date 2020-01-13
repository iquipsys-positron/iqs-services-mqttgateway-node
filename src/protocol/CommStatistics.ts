import { IStreamable } from 'iqs-libs-protocols-node';
import { IStream } from 'iqs-libs-protocols-node';

export class CommStatistics implements IStreamable {
    public device_udi?: string;
    public init_time?: Date;
    public up_time?: Date;
    public up_packets?: number;
    public up_errors?: number;
    public down_time?: Date;
    public down_packets?: number;
    public down_errors?: number;

    public stream(stream: IStream): void {
        this.device_udi = stream.streamNullableString(this.device_udi);
        this.init_time = stream.streamNullableDateTime(this.init_time);

        this.up_time = stream.streamNullableDateTime(this.up_time);
        this.up_packets = stream.streamNullableDWord(this.up_packets);
        this.up_errors = stream.streamNullableDWord(this.up_errors);

        this.down_time = stream.streamNullableDateTime(this.down_time);
        this.down_packets = stream.streamNullableDWord(this.down_packets);
        this.down_errors = stream.streamNullableDWord(this.down_errors);
    }
}