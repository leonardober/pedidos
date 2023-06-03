import { /* inject, */ BindingScope, injectable } from '@loopback/core';
import { ANY } from '@loopback/repository';
import { Llaves } from '../config/llaves';
require('dotenv').config();
const sgMail = require('@sendgrid/mail')
const twilio = require('twilio');
@injectable({ scope: BindingScope.TRANSIENT })
export class NotificacionService {
  constructor(/* Add @inject to inject parameters */) { }

  /*
   * servicio de notificacion por correo electronico
   */

  // eslint-disable-next-line @typescript-eslint/naming-convention
  EnviarEmail(destino: string, asunto: string, contenido: string) {


    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    const msg = {
      to: destino, // Change to your recipient
      from: Llaves.emailFrom, // Change to your verified sender
      subject: asunto,
      html: contenido,
    }
    sgMail
      .send(msg)
      .then(() => {
        console.log('correo enviado desde klichorf')
      })
      .catch((error: unknown) => {
        console.error(error)
      })



  }



  EnviarSMS(TelefonoDestino: string, Mensaje: string,) {



    //  servicio de notificacion por SMS


    // Download the helper library from https://www.twilio.com/docs/node/install
    // Set environment variables for your credentials
    // Read more at http://twil.io/secure

    try {

      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = require("twilio")(accountSid, authToken);

      client.messages.create({
        body: Mensaje,
        to: TelefonoDestino,
        from: Llaves.TwilioPhone,
      }).then((message: { sid: any; }) => {
        console.log(message.sid);
        return true;
      });

    }

    catch {
      return false;
    }

  }





}

