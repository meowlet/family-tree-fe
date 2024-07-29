import Cookies from "js-cookie";

class Auth {
  setToken(token: string) {
    Cookies.set("accessToken", token);
  }

  getToken() {
    return Cookies.get("accessToken");
  }

  removeToken() {
    Cookies.remove("accessToken");
  }
}

export default new Auth();
