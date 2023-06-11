import { service } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  Null,
  NULL,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import fetch from 'node-fetch';
import { Llaves } from '../config/llaves';
import { ResetearClave, Usuario, Credenciales, CambioClave, RecuperarUsuario, DobleFactorAutenticacion } from '../models';
import { UsuarioRepository } from '../repositories';
import { AutenticacionService, NotificacionService } from '../services';
import { Login } from '../models';
import { LoginRepository } from '../repositories';
import { PermisosRolMenu } from '../models/permisos-rol-menu.model';
import { UserProfile } from '@loopback/security';
import { error } from 'console';
require('dotenv').config();
import { Client } from "@sendgrid/client";
import sgMail = require("@sendgrid/mail");


export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @repository(LoginRepository)
    public loginRepository: LoginRepository,
    @service(AutenticacionService)
    public servicioAutenticacion: AutenticacionService,
    @service(NotificacionService)
    public notificacionService: NotificacionService
  ) { }


  @post('/validar-permisos')
  @response(200, {
    description: "Validación de permisos de usuario para lógica de negocio",
    content: { 'application/json': { schema: getModelSchemaRef(PermisosRolMenu) } }
  })
  async ValidarPermisosDeUsuario(
    @requestBody(
      {
        content: {
          'application/json': {
            schema: getModelSchemaRef(PermisosRolMenu)
          }
        }
      }
    )
    datos: PermisosRolMenu
  ): Promise<UserProfile | undefined> {
    let idRol = this.servicioAutenticacion.obtenerRolDesdeToken(datos.token);
    return this.servicioAutenticacion.VerificarPermisoDeUsuarioPorRol(idRol, datos.idMenu, datos.accion);
  }







  ///// identificar usuario metodos personalizados

  @post('/identificarUsuario')
  @response(200, {
    description: 'Identificacion de usuarios',
    content: { 'application/json': { schema: getModelSchemaRef(Credenciales) } }

  })
  async identificarUsuario(
    @requestBody(
      {
        content: {
          'application/json': {
            schema: getModelSchemaRef(Credenciales)
          }
        }
      }

    )
    credenciales: Credenciales
  ): Promise<object | String> {
    let usuario = await this.servicioAutenticacion.identificarUsuario(credenciales);
    if (usuario) {
      let codigo2fa = this.servicioAutenticacion.GenerarClave();
      console.log("Codigo de Validacion enviado al correo");
      console.log(codigo2fa);
      let autenticado = Llaves.CodigoValidacion;
      let login: Login = new Login();
      login.usuarioId = usuario.id!;
      login.codigo2fa = codigo2fa;
      login.estadoCodigo2fa = false;
      login.token = "";
      login.estadoToken = false;
      this.loginRepository.create(login);
      usuario.clave = "";

      // notificar al usuario vía correo o sms


      const contenido = `Hola ${usuario.nombre}, su codigo de validacion es ${codigo2fa}` ;
      let Correo_enviado = this.notificacionService.EnviarEmail(usuario.correo, Llaves.AsuntoCodigoValidacionUsuario, contenido)
      
      let asunto = `Hola ${usuario.nombre}, su codigo de validacion es ${usuario.contrasena}`;
      let MSMenviado = this.notificacionService.EnviarSMS(usuario.telefono, asunto);
  

      

      if (Correo_enviado = true,MSMenviado = true) {
        return {
          Correo_enviado: " Codigo de Validacion enviado al correo  " + usuario.correo,
          MSMenviado: " Codigo de Validacion enviado al celular " + usuario.telefono,
   
          
        };


      } if (Correo_enviado = false) {


        return {
          Correo_enviado: "no se puede enviar al correo"

        }
      } if (MSMenviado = false) {

        return {
          MSMenviado: " El Codigo de Validacion no fue enviado al celular  " + usuario.telefono
        };

    

      }









      return autenticado;

    }
    return new HttpErrors[401]("Credenciales incorrectas.");
  }


  @post('/verificar-2fa')
  @response(200, {
    description: "Validar un código de 2fa"
  })
  async VerificarCodigo2fa(
    @requestBody(
      {
        content: {
          'application/json': {
            schema: getModelSchemaRef(DobleFactorAutenticacion)
          }
        }
      }
    )
    credenciales: DobleFactorAutenticacion
  ): Promise<object> {
    let usuario = await this.servicioAutenticacion.validarCodigo2fa(credenciales);
    if (usuario) {
      let token = this.servicioAutenticacion.GenerarTokenJWT(usuario);
      if (usuario) {
        usuario.clave = "";

        try {
          this.usuarioRepository.logins(usuario.id).patch(
            {
              estadoCodigo2fa: true,
              token: token
            },
            {
              estadoCodigo2fa: false
            });
        } catch {
          console.log("No se ha almacenado el cambio del estado de token en la base de datos.")
        }
        return {
          user: usuario.correo,
          token: token
        };
      }
    }
    return new HttpErrors[401]("Código de 2fa inválido para el usuario definido.");








  }


















  /////cambio de contraseña


  @post('/cambiar-clave')
  @response(200, {
    description: 'Cambio de clave de usuarios',
    content: { 'application/json': { schema: getModelSchemaRef(CambioClave) } },
  })
  async cambiarClave(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CambioClave, {
            title: 'Cambio de clave del Usuario'
          }),
        },
      },
    })
    credencialesClave: CambioClave,
  ): Promise<Object | null> {
    let usuario = await this.usuarioRepository.findOne({
      where: {

        id: credencialesClave.id_usuario,
        contrasena: credencialesClave.clave_actual



      }
    });
    if (usuario) {

      ///////// generar token y agregarlo a la respúesta
      usuario.contrasena = credencialesClave.nueva_clave;
      console.log(usuario.contrasena);

      const claveCifrada = this.servicioAutenticacion.CifrarClave(usuario.contrasena);
      console.log(claveCifrada);
      usuario.clave = claveCifrada

      await this.usuarioRepository.updateById(credencialesClave.id_usuario, usuario)



      ///////////////////////////////  envio de mensajes email

      const contenido = `Hola ${usuario.nombre}, su usuario es ${usuario.correo} y  su nueva contrasena es ${usuario.contrasena}`;
      this.notificacionService.EnviarEmail(usuario.correo, Llaves.AsuntoCambioContrasena, contenido)
      ///////////// sms
      let asunto = `Hola ${usuario.nombre}, su nueva contraseña es ${usuario.contrasena}`;
      let enviado = this.notificacionService.EnviarSMS(usuario.telefono, asunto);

      if (enviado = true) {
        return {
          enviado: " contraseña actualizada"
        };



      }

      return {
        enviado: "no se puede enviar el mensaje asegurese de tener un numero telefonico real"
      };



    }



    return usuario;

  }








  //////////resetear pasword


  @post('/recuperar-usuario')
  @response(200, {
    description: 'recuperacion de  usuario',
    content: { 'application/json': { schema: getModelSchemaRef(RecuperarUsuario) } },
  })
  async RecuperarUsuario(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RecuperarUsuario, {
            title: 'recuperacion de Usuario'
          }),
        },
      },
    })
    RecuperarUsuario: RecuperarUsuario,
  ): Promise<Object> {

    let usuario = await this.usuarioRepository.findOne({ where: { cedula: RecuperarUsuario.cedula } })
    if (!usuario) {
      throw new HttpErrors[403]("No se encuentra el usuario")

    }




    ///////////////////////////////  envio de mensajes email

    const contenido = `Hola ${usuario.nombre}  su usuario es:  ${usuario.correo}`;
    this.notificacionService.EnviarEmail(usuario.correo, Llaves.AsuntoRecuperarUsuario, contenido)







    //notificar al Usuario para consumir servicio del@  SMS
    let asunto = `Hola ${usuario.nombre}, su usuario es ${usuario.correo}`;
    let notificado = this.notificacionService.EnviarSMS(usuario.telefono, asunto)




    return usuario.correo
  }







  /*///recuperar Usuario
  


  @post('/recuperar-usuario')
  @response(200, {
    description: 'recuperacion de  usuario',
    content: { 'application/json': { schema: getModelSchemaRef(RecuperarUsuario) } },
  })
  async RecuperarUsuario(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RecuperarUsuario, {
            title: 'recuperacion de Usuario'
          }),
        },
      },
    })
    RecuperarUsuario: RecuperarUsuario,
  ): Promise<Object | null> {
    let usuario = await this.usuarioRepository.findOne({where: {cedula: RecuperarUsuario.cedula}});
   
    if (usuario!) {
      
      
      ///////////////////////////////  envio de mensajes email

      const contenido = `Hola ${usuario.nombre}  su usuario es:  ${usuario.correo}`;
      this.notificacionService.EnviarEmail(usuario.correo, Llaves.AsuntoRecuperarUsuario, contenido)




      ///////////// sms
      let asunto = `Hola ${usuario.nombre}, su usuario es ${usuario.correo}`;
      let enviado = this.notificacionService.EnviarSMS(usuario.telefono, asunto)

      if (enviado = true) {
        return {
          enviado: " Recuperacion de usuario exitosa"
        };



      }

      return {
        enviado: "el usuario no existe"
      };



    }



    return usuario;

  }

*/
































  /////// crear usuario

  @post('/usuarios')
  @response(200, {
    description: 'Usuario model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Usuario) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, 'id'>,
  ): Promise<Usuario> {




    const clave = this.servicioAutenticacion.GenerarClave();
    console.log(clave);
    usuario.contrasena = clave
    const claveCifrada = this.servicioAutenticacion.CifrarClave(clave);
    console.log(claveCifrada);
    usuario.clave = claveCifrada
    const p = await this.usuarioRepository.create(usuario);

    //notificar al Usuario para consumir servicio del@ correo
    /*
    let asunto = 'Credenciales de acceso al Sistema';
    let contenidos = `Hola ${usuario.nombre}, su usuario es ${usuario.correo} y la contrasena es ${clave}`;
    let destino = usuario.correo;
    fetch(`http://127.0.0.1:5000/envio-correo?correo_destino=${destino}&asunto=${asunto}&contenido=${contenidos}`)
    .then ((data :any)=>{
      console.log(data);
    })
    return p;*/


    /////////////////////////////// esta lineas de 94 al 96 son una alternativa de envio de mensajes email

    const contenido = `Hola ${usuario.nombre}, su usuario es ${usuario.correo} y la contraseña es ${clave}`;
    this.notificacionService.EnviarEmail(usuario.correo, Llaves.AsuntoRegistroUsuario, contenido)


    /////////////////////////////// envio sms


    const kontenido = `Hola ${usuario.nombre}, su usuario es ${usuario.correo} y la contraseña es ${clave}`;
    let enviado = this.notificacionService.EnviarSMS(usuario.telefono, kontenido);











    return p;








  }

  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, { partial: true }),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, { exclude: 'where' }) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, { partial: true }),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuarios/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }

  //////////resetear pasword

  @post('/reset-password')
  @response(200, {
    description: 'Usuario model instance',
    content: { 'application/json': { schema: getModelSchemaRef(ResetearClave) } },
  })
  async resetPassword(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ResetearClave, {

          }),
        },
      },
    })
    resetearClave: ResetearClave,
  ): Promise<Object> {

    let usuario = await this.usuarioRepository.findOne({ where: { correo: resetearClave.correo } })
    if (!usuario) {
      throw new HttpErrors[403]("No se encuentra el usuario")
    }
    const clave = this.servicioAutenticacion.GenerarClave();
    console.log(clave);
    const claveCifrada = this.servicioAutenticacion.CifrarClave(clave);
    console.log(claveCifrada);
    usuario.clave = claveCifrada
    usuario.contrasena = clave
    await this.usuarioRepository.update(usuario);









    const mensaje = `Hola ${usuario.nombre}, su usuario es ${usuario.correo} y  su nueva contrasena es ${usuario.contrasena}`;
    this.notificacionService.EnviarEmail(usuario.correo, Llaves.AsuntoRestableserClave, mensaje)




    //notificar al Usuario para consumir servicio del@  SMS




    let contenido = `Hola ${usuario.nombre}, su nueva contraseña es ${clave}`;
    let enviado = this.notificacionService.EnviarSMS(usuario.telefono, contenido);


    if (enviado = true) {
      return {
        enviado: " contraseña actualizada"
      };
    }

    return {
      enviado: "no se puede enviar el mensaje asegurese de tener un numero telefonico real"
    };






  }





}













