import {
    UseInterceptors, 
    NestInterceptor,
    ExecutionContext,
    CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';

// to remove any type
interface ClassConstructor {
    new (...args: any[]): {}
}


export function Serialize(dto: ClassConstructor){
    return UseInterceptors(new SerializerInterceptor(dto));
}

export class SerializerInterceptor implements NestInterceptor{
    constructor(private dto: any){}

    intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
        // Run this before a request is handled by the request 
        

        return handler.handle().pipe(
            map((data: any)=>{
                // run sth before the response is sent out
                return plainToClass(this.dto, data, {
                    excludeExtraneousValues: true,
                });
            }),
        );
    }
}
