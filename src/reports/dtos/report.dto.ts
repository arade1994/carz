import { Expose, Transform } from 'class-transformer';

export class ReportDto {
    @Expose()
    make: string;

    @Expose()
    model: string;

    @Expose()
    mileage: number;

    @Expose()
    year: number;

    @Expose()
    lng: number;

    @Expose()
    lat: number;

    @Expose()
    price: number;

    @Expose()
    @Transform(({ obj }) => obj.user.id)
    userId: number;
}
