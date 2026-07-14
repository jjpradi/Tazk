export function getsessionStorage() {
  let storage = JSON.parse(sessionStorage.getItem('login')) || ''
  return storage
}

export default function cookie() {
  let employee_id = JSON.parse(sessionStorage.getItem('login'))?.employee_id || '';
  return employee_id;
}

export function getAccessToken(){
  let accessToken = JSON.parse(sessionStorage.getItem('login'))?.accessToken || '';
  return accessToken;
}

export function getRefreshToken(){
  let refreshToken = JSON.parse(sessionStorage.getItem('login'))?.refreshToken || '';
  return refreshToken;
}

export function updateAccessToken(token){
  let login = JSON.parse(sessionStorage.getItem('login')) || '';
  login.accessToken = token
  sessionStorage.setItem('login',JSON.stringify(login))
}

export function updateRefreshToken(token){
  let login = JSON.parse(sessionStorage.getItem('login')) || '';
  login.refreshToken = token
  sessionStorage.setItem('login',JSON.stringify(login))
}

export function updateSubCompany(newData){
  let login = JSON.parse(sessionStorage.getItem('login')) || '';
  login.subcompany = newData
  sessionStorage.setItem('login',JSON.stringify(login))
}


