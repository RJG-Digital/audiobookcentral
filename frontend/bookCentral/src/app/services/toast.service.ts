import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) {}

  async presentToast(
    message: string,
    color: 'danger'| 'success' | 'primary', 
    position: 'top' | 'middle' | 'bottom' = 'top', 
    duration: number = 2000, 
    animated = true) {
    const toast = await this.toastController.create({
      message,
      duration,
      position,
      animated,
      color
    });
    await toast.present();
  }
}