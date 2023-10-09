import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EchartsService {
  static eventBus = new Subject();
  static echartsIns: any;
  static timeScope = '';
  static type = '';
  constructor() {}
}
