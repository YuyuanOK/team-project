/**
 * 本地数据加密工具
 * 使用Base64编码（简单加密，实际项目中建议使用更安全的加密方法）
 */

export default {
  /**
   * 加密数据
   * @param {any} data - 要加密的数据
   * @returns {string} 加密后的字符串
   */
  encrypt(data) {
    try {
      const str = JSON.stringify(data);
      // 使用Base64编码
      if (typeof btoa !== 'undefined') {
        return btoa(unescape(encodeURIComponent(str)));
      } else {
        // uni-app环境下的Base64编码
        return this.base64Encode(str);
      }
    } catch (e) {
      console.error('加密失败:', e);
      return data;
    }
  },
  
  /**
   * 解密数据
   * @param {string} encryptedData - 加密后的字符串
   * @returns {any} 解密后的数据
   */
  decrypt(encryptedData) {
    try {
      let str;
      if (typeof atob !== 'undefined') {
        str = decodeURIComponent(escape(atob(encryptedData)));
      } else {
        // uni-app环境下的Base64解码
        str = this.base64Decode(encryptedData);
      }
      return JSON.parse(str);
    } catch (e) {
      console.error('解密失败:', e);
      return encryptedData;
    }
  },
  
  /**
   * Base64编码（兼容uni-app）
   */
  base64Encode(str) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    
    for (let i = 0; i < str.length; i += 3) {
      const a = str.charCodeAt(i);
      const b = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
      const c = i + 2 < str.length ? str.charCodeAt(i + 2) : 0;
      
      const bitmap = (a << 16) | (b << 8) | c;
      
      output += chars.charAt((bitmap >> 18) & 63);
      output += chars.charAt((bitmap >> 12) & 63);
      output += i + 1 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
      output += i + 2 < str.length ? chars.charAt(bitmap & 63) : '=';
    }
    
    return output;
  },
  
  /**
   * Base64解码（兼容uni-app）
   */
  base64Decode(str) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let i = 0;
    
    str = str.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    
    while (i < str.length) {
      const encoded1 = chars.indexOf(str.charAt(i++));
      const encoded2 = chars.indexOf(str.charAt(i++));
      const encoded3 = chars.indexOf(str.charAt(i++));
      const encoded4 = chars.indexOf(str.charAt(i++));
      
      const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;
      
      if (encoded3 !== 64) output += String.fromCharCode((bitmap >> 16) & 255);
      if (encoded4 !== 64) output += String.fromCharCode((bitmap >> 8) & 255);
      output += String.fromCharCode(bitmap & 255);
    }
    
    return output;
  },
  
  /**
   * 加密存储（封装uni.setStorageSync，自动加密敏感数据）
   * @param {string} key - 存储键名
   * @param {any} data - 要存储的数据
   * @param {boolean} needEncrypt - 是否需要加密，默认false
   */
  setEncryptedStorage(key, data, needEncrypt = false) {
    try {
      if (needEncrypt) {
        const encrypted = this.encrypt(data);
        uni.setStorageSync(key, encrypted);
      } else {
        uni.setStorageSync(key, typeof data === 'string' ? data : JSON.stringify(data));
      }
      return true;
    } catch (e) {
      console.error('加密存储失败:', e);
      return false;
    }
  },
  
  /**
   * 解密读取（封装uni.getStorageSync，自动解密敏感数据）
   * @param {string} key - 存储键名
   * @param {any} defaultValue - 默认值
   * @param {boolean} isEncrypted - 数据是否已加密，默认false
   */
  getDecryptedStorage(key, defaultValue = null, isEncrypted = false) {
    try {
      const data = uni.getStorageSync(key);
      if (!data) return defaultValue;
      
      if (isEncrypted) {
        return this.decrypt(data);
      } else {
        try {
          return JSON.parse(data);
        } catch (e) {
          return data;
        }
      }
    } catch (e) {
      console.error('解密读取失败:', e);
      return defaultValue;
    }
  }
};
