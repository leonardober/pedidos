import { /* inject, */ BindingScope, injectable } from '@loopback/core';
import { ANY } from '@loopback/repository';
import { Llaves } from '../config/llaves';
import { Headers } from 'node-fetch';
require('dotenv').config();
const sgMail = require('@sendgrid/mail')
const twilio = require('twilio');



@injectable({ scope: BindingScope.TRANSIENT })
export class NotificacionService {
  constructor(/* Add @inject to inject parameters */) { }

  /*
   * servicio de notificacion por correo electronico
   */

  EnviarEmail(destino: string, asunto: string, contenido: string) {


    try {


      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      const msg = {

        to: destino, // Change to your recipient
        from: Llaves.emailFrom, // Change to your verified sender
        subject: asunto,
        html: contenido,
        template_id: 'd-c7d81c859689479a8d5204148c050ccc',
        dynamic_template_data: {
          contenido: contenido,
          redes: "hola",
        },
      }

      sgMail

        .send(msg)
        .then(() => {
          console.log('correo enviado desde klichorf')
        })
        .catch((error: unknown) => {
          console.error(error)
        })

      return true

    } catch {


      return false



    }



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





  crearplantilla() {




    const sgMail = require('@sendgrid/mail')

    const client = require('@sendgrid/client');
    client.setApiKey(process.env.SENDGRID_API_KEY);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    const data = {
      "name": "example_name",
      "generation": "dynamic" //:"legacy"
    };

    const request = {
      url: ` https://api.sendgrid.com/v3/templates`,
      method: 'POST',
      body: data,
      headers: {
        '-H Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
    }

    client.request(request)
      .then((response: { statusCode: any; body: any; }) => {
        console.log(response.statusCode);
        console.log(response.body);
      })
      .catch((error: any) => {
        console.error(error);
      });

    throw new Error("Function not implemented.");

  }

  ///////////ENVIO DE MENSAJES POR WHATS APP


  actualizaNombreUusuario() {
    const client = require('@sendgrid/client');
    client.setApiKey(process.env.SENDGRID_API_KEY);

    const data = {
      "username": "test_username"
    };

    const request = {
      url: `https://api.sendgrid.com/v3/user/username`,
      method: 'PUT',
      body: data
    }

    client.request(request)
      .then((response: { statusCode: any; body: any; }, body: any) => {
        console.log(response.statusCode);
        console.log(response.body);
      })
      .catch((error: any) => {
        console.error(error);
      });



  }





  bibiotecDiseño() {


    const client = require('@sendgrid/client');
    client.setApiKey(process.env.SENDGRID_API_KEY);
  
  
    const data = {
      name: "Ahoy, World!",
      editor: "design",
      subject: "Getting Started",
      html_content: "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n<html data-editor-version=\"2\" class=\"sg-campaigns\" xmlns=\"http://www.w3.org/1999/xhtml\">\n    <head>\n      <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1\">\n      <!--[if !mso]><!-->\n      <meta http-equiv=\"X-UA-Compatible\" content=\"IE=Edge\">\n      <!--<![endif]-->\n      <!--[if (gte mso 9)|(IE)]>\n      <xml>\n        <o:OfficeDocumentSettings>\n          <o:AllowPNG/>\n          <o:PixelsPerInch>96</o:PixelsPerInch>\n        </o:OfficeDocumentSettings>\n      </xml>\n      <![endif]-->\n      <!--[if (gte mso 9)|(IE)]>\n  <style type=\"text/css\">\n    body {width: 600px;margin: 0 auto;}\n    table {border-collapse: collapse;}\n    table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}\n    img {-ms-interpolation-mode: bicubic;}\n  </style>\n<![endif]-->\n      <style type=\"text/css\">\n    body, p, div {\n      font-family: arial,helvetica,sans-serif;\n      font-size: 14px;\n    }\n    body {\n      color: #000000;\n    }\n    body a {\n      color: #1188E6;\n      text-decoration: none;\n    }\n    p { margin: 0; padding: 0; }\n    table.wrapper {\n      width:100% !important;\n      table-layout: fixed;\n      -webkit-font-smoothing: antialiased;\n      -webkit-text-size-adjust: 100%;\n      -moz-text-size-adjust: 100%;\n      -ms-text-size-adjust: 100%;\n    }\n    img.max-width {\n      max-width: 100% !important;\n    }\n    .column.of-2 {\n      width: 50%;\n    }\n    .column.of-3 {\n      width: 33.333%;\n    }\n    .column.of-4 {\n      width: 25%;\n    }\n    ul ul ul ul  {\n      list-style-type: disc !important;\n    }\n    ol ol {\n      list-style-type: lower-roman !important;\n    }\n    ol ol ol {\n      list-style-type: lower-latin !important;\n    }\n    ol ol ol ol {\n      list-style-type: decimal !important;\n    }\n    @media screen and (max-width:480px) {\n      .preheader .rightColumnContent,\n      .footer .rightColumnContent {\n        text-align: left !important;\n      }\n      .preheader .rightColumnContent div,\n      .preheader .rightColumnContent span,\n      .footer .rightColumnContent div,\n      .footer .rightColumnContent span {\n        text-align: left !important;\n      }\n      .preheader .rightColumnContent,\n      .preheader .leftColumnContent {\n        font-size: 80% !important;\n        padding: 5px 0;\n      }\n      table.wrapper-mobile {\n        width: 100% !important;\n        table-layout: fixed;\n      }\n      img.max-width {\n        height: auto !important;\n        max-width: 100% !important;\n      }\n      a.bulletproof-button {\n        display: block !important;\n        width: auto !important;\n        font-size: 80%;\n        padding-left: 0 !important;\n        padding-right: 0 !important;\n      }\n      .columns {\n        width: 100% !important;\n      }\n      .column {\n        display: block !important;\n        width: 100% !important;\n        padding-left: 0 !important;\n        padding-right: 0 !important;\n        margin-left: 0 !important;\n        margin-right: 0 !important;\n      }\n      .social-icon-column {\n        display: inline-block !important;\n      }\n    }\n  </style>\n      <!--user entered Head Start--><!--End Head user entered-->\n    </head>\n    <body>\n      <center class=\"wrapper\" data-link-color=\"#1188E6\" data-body-style=\"font-size:14px; font-family:arial,helvetica,sans-serif; color:#000000; background-color:#FFFFFF;\">\n        <div class=\"webkit\">\n          <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" class=\"wrapper\" bgcolor=\"#FFFFFF\">\n            <tr>\n              <td valign=\"top\" bgcolor=\"#FFFFFF\" width=\"100%\">\n                <table width=\"100%\" role=\"content-container\" class=\"outer\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                  <tr>\n                    <td width=\"100%\">\n                      <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                        <tr>\n                          <td>\n                            <!--[if mso]>\n    <center>\n    <table><tr><td width=\"600\">\n  <![endif]-->\n                                    <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"width:100%; max-width:600px;\" align=\"center\">\n                                      <tr>\n                                        <td role=\"modules-container\" style=\"padding:0px 0px 0px 0px; color:#000000; text-align:left;\" bgcolor=\"#FFFFFF\" width=\"100%\" align=\"left\"><table class=\"module preheader preheader-hide\" role=\"module\" data-type=\"preheader\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;\">\n    <tr>\n      <td role=\"module-content\">\n        <p></p>\n      </td>\n    </tr>\n  </table><table class=\"module\" role=\"module\" data-type=\"text\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\" data-muid=\"41f90842-501c-4f08-96c9-17c0f74cb841\" data-mc-module-version=\"2019-10-22\">\n    <tbody>\n      <tr>\n        <td style=\"padding:18px 0px 18px 0px; line-height:22px; text-align:inherit;\" height=\"100%\" valign=\"top\" bgcolor=\"\" role=\"module-content\"><div><div style=\"font-family: inherit; text-align: inherit\">Ahoy, World!</div><div></div></div></td>\n      </tr>\n    </tbody>\n  </table><div data-role=\"module-unsubscribe\" class=\"module\" role=\"module\" data-type=\"unsubscribe\" style=\"color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:Center;\" data-muid=\"4e838cf3-9892-4a6d-94d6-170e474d21e5\"><div class=\"Unsubscribe--addressLine\"><p class=\"Unsubscribe--senderName\" style=\"font-size:12px; line-height:20px;\">{{Sender_Name}}</p><p style=\"font-size:12px; line-height:20px;\"><span class=\"Unsubscribe--senderAddress\">{{Sender_Address}}</span>, <span class=\"Unsubscribe--senderCity\">{{Sender_City}}</span>, <span class=\"Unsubscribe--senderState\">{{Sender_State}}</span> <span class=\"Unsubscribe--senderZip\">{{Sender_Zip}}</span></p></div><p style=\"font-size:12px; line-height:20px;\"><a class=\"Unsubscribe--unsubscribeLink\" href=\"{{{unsubscribe}}}\" target=\"_blank\" style=\"\">Unsubscribe</a> - <a href=\"{{{unsubscribe_preferences}}}\" target=\"_blank\" class=\"Unsubscribe--unsubscribePreferences\" style=\"\">Unsubscribe Preferences</a></p></div></td>\n                                      </tr>\n                                    </table>\n                                    <!--[if mso]>\n                                  </td>\n                                </tr>\n                              </table>\n                            </center>\n                            <![endif]-->\n                          </td>\n                        </tr>\n                      </table>\n                    </td>\n                  </tr>\n                </table>\n              </td>\n            </tr>\n          </table>\n        </div>\n      </center>\n    </body>\n  </html>",
      plain_content: "Ahoy, World!\n\n{{Sender_Name}}\n\n{{Sender_Address}} , {{Sender_City}} , {{Sender_State}} {{Sender_Zip}}\n\nUnsubscribe ( {{{unsubscribe}}} ) - Unsubscribe Preferences ( {{{unsubscribe_preferences}}} )"
    };

    const request = {
      url: `https://api.sendgrid.com/v3/designs`,
      method: 'POST',
      body: data
    }

    client.request(request)
      .then((response: { statusCode: any; body: any; }, body: any) => {
        console.log(response.statusCode);
        console.log(response.body);
      })
      .catch((error: any) => {
        console.error(error);
      });

  }




obetenerDiseno(){

  const client = require('@sendgrid/client');
  client.setApiKey(process.env.SENDGRID_API_KEY);
  
  const id = "ae3bf59e-8537-4680-8f7f-1130c4803edb";  
  
  const request = {
    url: `https://api.sendgrid.com/v3/designs/${id}`,
    method: 'GET',
    
  }
  
  client.request(request)
    .then((response: { statusCode: any; body: any; }, body: any) => {
      console.log(response.statusCode);
      console.log(response.body);
    })
    .catch((error: any) => {
      console.error(error);
    });

    throw new Error("no se pudo obtener el diseño");





}









agreagarIp(){

  const client = require('@sendgrid/client');
  client.setApiKey(process.env.SENDGRID_API_KEY);
  
  const data = {
    ips: [
      {
        ip: "191.107.0.221"
      }
    ],

    headers: {
      '-H Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': `application/json`
    
    },
  };
  
  const request = {
    url: `https://api.sendgrid.com/v3/access_settings/whitelist`,
    method: 'POST',
    body: data
  }
  
  client.request(request)
    .then((response: { statusCode: any; body: any; }, body: any) => {
      console.log(response.statusCode);
      console.log(response.body);
    })
    .catch((error: any) => {
      console.error(error);
    });



}
















}