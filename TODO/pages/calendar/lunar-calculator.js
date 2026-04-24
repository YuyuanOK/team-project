/**
 * @fileoverview Lunar-Solar Converter
 * @author L.M.T <conf4good@gmail.com>
 * @version 2.0
 * 
 * This utility is used to convert dates between the solar (Gregorian) calendar and the lunar calendar.
 * It provides detailed information about the lunar date, including traditional Chinese stems, branches, and zodiac signs.
 */

/**
 * @description 农历计算函数
 * @author mehaotian
 * @date 2020/07/22
 * @version 2.0.2
 */
var LunarHelp = {
    lunarInfo: [0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, 0x04ae0,
        0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, 0x04970, 0x0a4b0,
        0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0, 0x0ea50,
        0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, 0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0,
        0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, 0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0,
        0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0, 0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260,
        0x0f263, 0x0d950, 0x05b57, 0x056a0, 0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558,
        0x0b540, 0x0b5a0, 0x195a6, 0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46,
        0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5,
        0x092e0, 0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
        0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, 0x07954,
        0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, 0x05aa0, 0x076a3,
        0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, 0x0b5a0, 0x056d0, 0x055b2,
        0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0
    ],
    // 阳历天数
    solarMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    // 天干
    Gan: ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"],
    // 地支
    Zhi: ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"],
    // 属相
    Animals: ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"],
    // 节气
    solarTerm: ["小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋",
        "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"
    ],
    sTermInfo: [0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693,
        263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758
    ],
    nStr1: ['日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
    nStr2: ['初', '十', '廿', '卅', ' '],
    // 公历节日
    sFtv: [
        "0101 元旦",
        "0214 情人节",
        "0308 妇女节",
        "0312 植树节",
        "0401 愚人节",
        "0404 清明节",
        "0501 劳动节",
        "0504 青年节",
        "0601 儿童节",
        "0701 建党节",
        "0801 建军节",
        "0910 教师节",
        "1001 国庆节",
        "1224 平安夜",
        "1225 圣诞节"
    ],
    // 农历节日
    lFtv: [
        "0101 春节",
        "0115 元宵节",
        "0505 端午节",
        "0707 七夕节",
        "0715 中元节",
        "0815 中秋节",
        "0909 重阳节",
        "1208 腊八节",
        "1224 小年",
        "0100 除夕"
    ],
    /**
     * 传回农历y年的总天数
     * @param y
     * @returns {number}
     */
    lYearDays: function(y) {
        let i, sum = 348
        for (i = 0x8000; i > 0x8; i >>= 1) {
            sum += (this.lunarInfo[y - 1900] & i) ? 1 : 0
        }
        return (sum + this.leapDays(y))
    },

    /**
     * 传回农历y年闰月的天数
     * @param y
     * @returns {number}
     */
    leapDays: function(y) {
        if (this.leapMonth(y)) {
            return ((this.lunarInfo[y - 1900] & 0x10000) ? 30 : 29)
        } else {
            return (0)
        }
    },

    /**
     * 传回农历y年闰哪个月 1-12 , 没闰传回 0
     * @param y
     * @returns {number}
     */
    leapMonth: function(y) {
        return (this.lunarInfo[y - 1900] & 0xf)
    },

    /**
     * 传回农历y年m月的总天数
     * @param y
     * @param m
     * @returns {number}
     */
    monthDays: function(y, m) {
        return ((this.lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29)
    },


    /**
     * 传入日期物件, 传回农历日期物件
     * 该物件属性有 .year .month .day .isLeap .yearCyl .dayCyl .monthCyl
     * @param objDate
     * @returns {{isToday: boolean, year: number, month: number, day: number, isLeap: boolean, cDay: (*|number), cMonth: number, cYear: number, lDay: (number|*), lMonth: *, lYear: *, color: string, lunarFestival: string, solarFestival: string, solarTerms: string}}
     */
    solarToLunar: function(y, m, d) {
        let objDate;
        if (typeof y === 'object') {
            objDate = y;
            y = objDate.getFullYear();
            m = objDate.getMonth() + 1;
            d = objDate.getDate();
        } else {
            objDate = new Date(y, parseInt(m) - 1, d);
        }
        let i, leap = 0,
            temp = 0
        //修改
        let offset = (Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate()) - Date.UTC(1900, 0,
            31)) / 86400000
        for (i = 1900; i < 2050 && offset > 0; i++) {
            temp = this.lYearDays(i)
            offset -= temp
        }
        if (offset < 0) {
            offset += temp;
            i--
        }
        let year = i
        leap = this.leapMonth(i) //闰哪个月
        let isLeap = false
        for (i = 1; i < 13 && offset > 0; i++) {
            //闰月
            if (leap > 0 && i == (leap + 1) && isLeap == false) {
                --i;
                isLeap = true;
                temp = this.leapDays(year);
            } else {
                temp = this.monthDays(year, i);
            }
            //解除闰月
            if (isLeap == true && i == (leap + 1)) {
                isLeap = false
            }
            offset -= temp
        }
        if (offset == 0 && leap > 0 && i == leap + 1)
            if (isLeap) {
                isLeap = false;
            } else {
                isLeap = true;
                --i;
            }
        if (offset < 0) {
            offset += temp;
            --i;
        }
        let month = i
        let day = offset + 1
        let a = this.getResult(objDate, year, month, day, isLeap);
        return a;
    },
    getResult: function(objDate, year, month, day, isLeap) {
        let y = objDate.getFullYear()
        let m = objDate.getMonth() + 1
        let d = objDate.getDate()
        let lunar = {
            "lunarYear": year,
            "lunarMonth": month,
            "lunarDay": day,
            "isLeap": isLeap,
            "IDayCn": this.toChinaDay(day),
            "IMonthCn": (isLeap ? "闰" : "") + this.toChinaMonth(month),
        }
        return lunar;
    },
    /**
     * 数字转中文
     * @param m
     * @returns {string}
     */
    toChinaMonth: function(m) { // 月
        let s = ["", "正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "腊"];
        return s[m] + '月';
    },
    toChinaDay: function(d) { // 日
        let s;
        switch (d) {
            case 10:
                s = '初十';
                break;
            case 20:
                s = '二十';
                break;
            case 30:
                s = '三十';
                break;
            default:
                s = this.nStr2[Math.floor(d / 10)];
                s += this.nStr1[d % 10];
        }
        return (s);
    },
}
export default LunarHelp; 