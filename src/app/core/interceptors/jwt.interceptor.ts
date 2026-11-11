import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const token = storage.get('token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
