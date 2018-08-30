const _HOST = '172.18.197.120'
const _USER = 'sdcs'
const _PORT = '3307'
const _PASS = 'sysu_sdcs_123'
const _DB = 'InfoSys'


module.exports = {
  redisConfig:{
    port:6379,
    host:'127.0.0.1',
    password:'sysu_sdcs_123',
    db: 1
  },
  session_schema:{
    name: 'sdcs-session-id',
    saveUninitialized: true,
    resave: true,
    secret:'sdcs_info_sys',
    unset:'destroy',
    cookie:{
      path:'/',
      httpOnly:true,
      secure:false,
      maxAge: 24*60*60*1000
    }
  },
  session_config:{
    host:_HOST,
    user:_USER,
    password:_PASS,
    port:_PORT,
    database:_DB,
    schema:{
      tableName:'sessions',
      columnNames:{
        session_id:'sid',
        expires:'expires',
        data:'session'
      }
    }
  },
  mailer_config:{
    host:'smtp.qq.com',
    secureConnection: true,
    port:465,
    secure:true,
    auth:{
      user:'873421427@qq.com',
      pass: 'wibbozdzsxdwbfdd'
    }
  }
}
