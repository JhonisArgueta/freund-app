# Freund App — Node.js + PostgreSQL

Aplicación web desarrollada con **Node.js y PostgreSQL**, desplegada en una plataforma **PaaS (Platform as a Service) multicliente**, utilizando Docker y Kubernetes.

## Descripción

Freund es una aplicación web que incorpora autenticación de usuarios y un dashboard para la interacción con el sistema.

Este proyecto forma parte de una implementación académica de una plataforma PaaS que permite alojar y administrar aplicaciones de diferentes clientes mediante contenedores y recursos de Kubernetes.

## Tecnologías utilizadas

| Tecnología | Función |
|---|---|
| Node.js | Entorno de ejecución del backend |
| PostgreSQL | Base de datos relacional |
| HTML, CSS y JavaScript | Interfaz web |
| Docker | Contenerización de la aplicación |
| Kubernetes | Orquestación de contenedores |
| Git y GitHub | Control de versiones |

## Características principales

- Autenticación de usuarios.
- Validación de contraseñas mediante bcrypt.
- Conexión a PostgreSQL.
- Dashboard web.
- Configuración mediante variables de entorno.
- Despliegue mediante Docker y Kubernetes.
- Ejecución dentro de un namespace independiente para el cliente.

## Estructura del proyecto

```text
freund-node/
├── public/
│   ├── dashboard.html
│   └── index.html
├── .dockerignore
├── .gitignore
├── Dockerfile
├── package.json
├── package-lock.json
└── server.js
```

## Variables de entorno

La aplicación utiliza variables de entorno para gestionar su configuración y credenciales.

Entre ellas:

```env
DB_PASSWORD=valor_configurado_en_el_entorno
SESSION_SECRET=clave_secreta_configurada
```

Las credenciales reales no se incluyen en este repositorio.

## Instalación local

**1. Clonar el repositorio**

```bash
git clone https://github.com/JhonisArgueta/freund-app.git
cd freund-app
```

**2. Instalar dependencias**

```bash
npm install
```

**3. Configurar el entorno**

Configurar las variables de entorno requeridas por la aplicación, incluyendo las credenciales de PostgreSQL y el secreto de sesión.

**4. Ejecutar**

```bash
npm start
```

La ejecución requiere una instancia de PostgreSQL configurada y accesible.

## Despliegue en Kubernetes

La aplicación se integra en una plataforma PaaS multicliente que proporciona:

- Aislamiento de clientes mediante namespaces.
- Administración de recursos de CPU y memoria.
- Despliegues mediante Kubernetes Deployments.
- Comunicación interna mediante Services.
- Acceso HTTP/HTTPS mediante Ingress.
- Monitoreo de recursos.
- Escalabilidad horizontal mediante HPA.

## Arquitectura general

```text
Usuario
   |
   v
Ingress HTTPS
   |
   v
Kubernetes Service
   |
   v
Freund - Node.js
   |
   v
PostgreSQL
```

## Seguridad

- Credenciales gestionadas mediante variables de entorno.
- Contraseñas verificadas utilizando bcrypt.
- Aislamiento de recursos dentro de Kubernetes.
- Acceso HTTPS configurado desde la plataforma PaaS.

## Contexto académico

Este proyecto demuestra el despliegue de una aplicación Node.js con PostgreSQL dentro de una arquitectura PaaS multicliente, como parte de una práctica de computación en la nube y administración de aplicaciones contenerizadas.


