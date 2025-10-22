import { Component } from '@angular/core';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions } from "@angular/material/card";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-login',
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatFormField, MatLabel, MatIcon, MatCardActions],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

}
