import { getParams } from '@/libs/util'

let USER_MAP = {
  super_admin: {
    name: 'super_admin',
    password: 'super_admin',
    user_id: '1',
    access: ['super_admin', 'admin'],
    token: 'super_admin',
    avatar: 'https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png'
  },
  admin: {
    name: 'admin',
    password: 'admin',
    user_id: '2',
    access: ['admin'],
    token: 'admin',
    avatar: 'https://avatars0.githubusercontent.com/u/20942571?s=460&v=4'
  },
  test: {
    name: 'test',
    password: 'test',
    user_id: '3',
    access: ['admin'],
    token: 'test',
    avatar: 'https://avatars0.githubusercontent.com/u/20942571?s=460&v=4'
  }
}

export const login = req => {
  req = JSON.parse(req.body);

 // USER_MAP[req.userName].password===req.password

  if(USER_MAP[req.userName]){
    if(USER_MAP[req.userName].password===req.password){
      return { token: USER_MAP[req.userName].token,msg:'success！' }
    }else{
      return {msg:'密码错误！' }
    }
  }else{
    return {msg:'用户名不存在！' }
  }


   /*
    if(USER_MAP[req.userName] && USER_MAP[req.userName].password!==req.password){
    return { token: 'error',msg:'密码错误！' }
  }else if(USER_MAP[req.userName] && USER_MAP[req.userName].password===req.password){

  }



  if (USER_MAP[req.userName]) {
    return { token: USER_MAP[req.userName].token }
  }else {
    return { token: 'error' }
  }*/
}

export const getUserInfo = req => {
  const params = getParams(req.url)
  return USER_MAP[params.token]
}
export const addUserInfo = req => {
  req = JSON.parse(req.body)
  USER_MAP[req.userName] = {
    name: req.userName,
    password: req.password,
    user_id: Object.keys(USER_MAP).length + 1,
    access: ['admin', req.userName],
    token: 'admin',
    avatar: 'https://avatars0.githubusercontent.com/u/20942571?s=460&v=4'
  }
  return USER_MAP[req.userName]
}

export const logout = req => {
  return null
}
