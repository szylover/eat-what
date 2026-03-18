/**
 * 多来源菜单数据库
 * 每道菜: { name: string, time: number (分钟) }
 * 分类: hard(硬菜), fastMeat(快手肉菜), veg(素菜), cold(凉菜), soup(汤)
 */
const MENU_DB = {
  "老饭骨": {
    hard: [
      { name: "清炖狮子头", time: 60 }, { name: "红烧狮子头", time: 50 },
      { name: "红烧肉", time: 50 }, { name: "坛子肉", time: 70 },
      { name: "虎皮扣肉", time: 60 }, { name: "东坡肉", time: 80 },
      { name: "梅菜扣肉", time: 60 }, { name: "粉蒸肉", time: 50 },
      { name: "酱肘子", time: 90 }, { name: "红烧蹄膀", time: 80 },
      { name: "扒肘子", time: 70 }, { name: "红烧牛肉", time: 60 },
      { name: "大盘鸡", time: 45 }, { name: "汽锅鸡", time: 60 },
      { name: "佛跳墙", time: 120 }, { name: "干烧大黄鱼", time: 40 },
      { name: "松鼠桂鱼", time: 45 }, { name: "葱烧海参", time: 40 },
      { name: "扒原壳鲍鱼", time: 50 }, { name: "九转大肠", time: 60 },
      { name: "四喜丸子", time: 50 }, { name: "南煎丸子", time: 35 },
      { name: "糖醋鲤鱼", time: 35 }, { name: "带鱼段", time: 30 }
    ],
    fastMeat: [
      { name: "酱爆鸡丁", time: 15 }, { name: "宫保鸡丁", time: 15 },
      { name: "鱼香肉丝", time: 15 }, { name: "京酱肉丝", time: 15 },
      { name: "蒜泥白肉", time: 20 }, { name: "回锅肉", time: 15 },
      { name: "水煮肉片", time: 20 }, { name: "锅包肉", time: 20 },
      { name: "糖醋里脊", time: 20 }, { name: "干炸里脊", time: 15 },
      { name: "熘肝尖", time: 10 }, { name: "葱爆羊肉", time: 10 },
      { name: "水煮牛肉", time: 20 }, { name: "葱爆牛肉", time: 10 },
      { name: "辣子鸡", time: 20 }, { name: "白斩鸡", time: 30 },
      { name: "糟溜鱼片", time: 15 }, { name: "清蒸鱼", time: 20 },
      { name: "赛螃蟹", time: 10 }, { name: "炸烹虾段", time: 15 },
      { name: "软炸虾仁", time: 15 }, { name: "宫保虾球", time: 15 },
      { name: "油焖大虾", time: 20 }, { name: "蒜蓉粉丝蒸扇贝", time: 15 },
      { name: "木须肉", time: 15 }, { name: "滑炒里脊丝", time: 12 },
      { name: "焦熘肉段", time: 15 }, { name: "炒肝儿", time: 20 },
      { name: "爆三样", time: 12 }, { name: "酱爆桃仁鸡丁", time: 15 }
    ],
    veg: [
      { name: "麻婆豆腐", time: 15 }, { name: "锅塌豆腐", time: 20 },
      { name: "家常豆腐", time: 15 }, { name: "蟹黄豆腐", time: 20 },
      { name: "地三鲜", time: 15 }, { name: "醋溜土豆丝", time: 10 },
      { name: "干煸豆角", time: 15 }, { name: "蒜泥茄子", time: 15 },
      { name: "烧茄子", time: 20 }, { name: "鱼香茄子", time: 15 },
      { name: "炒合菜", time: 10 }, { name: "虎皮尖椒", time: 10 },
      { name: "上汤娃娃菜", time: 10 }, { name: "冬笋炒肉", time: 12 },
      { name: "醋溜白菜", time: 8 }, { name: "焦溜豆腐", time: 15 },
      { name: "炒豆芽", time: 8 }, { name: "素炒三丝", time: 10 },
      { name: "香菇油菜", time: 8 }, { name: "蚝油生菜", time: 8 }
    ],
    cold: [
      { name: "老北京芥末墩", time: 15 }, { name: "老虎菜", time: 5 },
      { name: "拌花菜", time: 10 }, { name: "五香花生米", time: 15 },
      { name: "拍黄瓜", time: 5 }, { name: "拌什锦", time: 10 },
      { name: "皮蛋豆腐", time: 5 }, { name: "炝拌土豆丝", time: 10 },
      { name: "蒜泥黄瓜", time: 5 }, { name: "凉拌木耳", time: 10 },
      { name: "姜汁皮蛋", time: 5 }, { name: "糖拌西红柿", time: 3 }
    ],
    soup: [
      { name: "乌鱼蛋汤", time: 15 }, { name: "酸辣汤", time: 15 },
      { name: "冬瓜丸子汤", time: 25 }, { name: "胡辣汤", time: 20 },
      { name: "腌笃鲜", time: 60 }, { name: "西红柿鸡蛋汤", time: 10 },
      { name: "紫菜蛋花汤", time: 8 }, { name: "酸菜白肉汤", time: 30 },
      { name: "三鲜汤", time: 15 }
    ]
  },

  "家常菜": {
    hard: [
      { name: "红烧排骨", time: 45 }, { name: "糖醋排骨", time: 40 },
      { name: "可乐鸡翅", time: 30 }, { name: "啤酒鸭", time: 50 },
      { name: "黄焖鸡", time: 35 }, { name: "板栗烧鸡", time: 40 },
      { name: "土豆炖牛腩", time: 60 }, { name: "萝卜炖羊肉", time: 70 },
      { name: "猪蹄炖黄豆", time: 80 }
    ],
    fastMeat: [
      { name: "番茄炒蛋", time: 8 }, { name: "青椒肉丝", time: 12 },
      { name: "洋葱炒蛋", time: 8 }, { name: "肉末蒸蛋", time: 15 },
      { name: "蒜苗回锅肉", time: 15 }, { name: "黄瓜炒鸡蛋", time: 8 },
      { name: "土豆烧肉", time: 30 }, { name: "蚂蚁上树", time: 15 },
      { name: "肉末豆腐", time: 12 }, { name: "韭菜炒蛋", time: 8 },
      { name: "西芹炒肉", time: 10 }, { name: "尖椒炒肉丝", time: 10 },
      { name: "莴笋炒肉片", time: 10 }, { name: "豉汁蒸排骨", time: 25 },
      { name: "滑蛋虾仁", time: 10 }, { name: "香煎豆腐", time: 12 },
      { name: "红烧鸡腿", time: 30 }, { name: "蒜苔炒肉", time: 10 }
    ],
    veg: [
      { name: "酸辣土豆丝", time: 10 }, { name: "手撕包菜", time: 8 },
      { name: "清炒空心菜", time: 5 }, { name: "蒜炒小白菜", time: 5 },
      { name: "西蓝花炒虾仁", time: 12 }, { name: "白灼秋葵", time: 8 },
      { name: "凉拌腐竹", time: 10 }, { name: "素炒豆干", time: 10 },
      { name: "炒藕片", time: 8 }, { name: "椒盐玉米", time: 15 },
      { name: "拔丝地瓜", time: 15 }, { name: "清炒山药", time: 8 },
      { name: "蒜蓉西蓝花", time: 8 }, { name: "荷塘小炒", time: 10 }
    ],
    cold: [
      { name: "凉拌黄瓜", time: 5 }, { name: "凉拌海带丝", time: 8 },
      { name: "凉拌粉丝", time: 10 }, { name: "凉拌鸡丝", time: 15 },
      { name: "蒜泥茄子", time: 15 }, { name: "白切鸡", time: 30 },
      { name: "口水鸡", time: 25 }, { name: "红油耳丝", time: 15 }
    ],
    soup: [
      { name: "西红柿鸡蛋汤", time: 10 }, { name: "紫菜蛋花汤", time: 8 },
      { name: "玉米排骨汤", time: 50 }, { name: "冬瓜排骨汤", time: 45 },
      { name: "山药排骨汤", time: 50 }, { name: "银耳莲子汤", time: 40 },
      { name: "南瓜粥", time: 30 }, { name: "皮蛋瘦肉粥", time: 40 }
    ]
  },

  "川湘菜": {
    hard: [
      { name: "水煮鱼", time: 30 }, { name: "毛血旺", time: 35 },
      { name: "干锅牛蛙", time: 25 }, { name: "剁椒鱼头", time: 25 },
      { name: "干锅排骨", time: 35 }, { name: "粉蒸排骨", time: 45 },
      { name: "小炒黄牛肉", time: 20 }, { name: "干锅花菜", time: 20 },
      { name: "干锅鸡", time: 30 }
    ],
    fastMeat: [
      { name: "麻辣香锅", time: 20 }, { name: "辣椒炒肉", time: 12 },
      { name: "小炒肉", time: 10 }, { name: "泡椒凤爪", time: 30 },
      { name: "歌乐山辣子鸡", time: 20 }, { name: "尖椒兔", time: 20 },
      { name: "盐煎肉", time: 12 }, { name: "农家小炒肉", time: 12 },
      { name: "毛氏红烧肉", time: 50 }, { name: "夫妻肺片", time: 25 },
      { name: "泡椒牛肉", time: 15 }, { name: "香辣虾", time: 20 },
      { name: "口味虾", time: 25 }, { name: "豆豉蒸排骨", time: 25 },
      { name: "水煮牛蛙", time: 20 }
    ],
    veg: [
      { name: "虎皮青椒", time: 8 }, { name: "干煸四季豆", time: 12 },
      { name: "酸辣土豆丝", time: 10 }, { name: "麻辣豆腐", time: 12 },
      { name: "火爆腰花", time: 10 }, { name: "擂辣椒皮蛋", time: 8 },
      { name: "农家小豆腐", time: 15 }, { name: "干锅有机花菜", time: 15 },
      { name: "酸豆角炒肉末", time: 10 }, { name: "外婆菜", time: 10 }
    ],
    cold: [
      { name: "川北凉粉", time: 10 }, { name: "红油抄手", time: 15 },
      { name: "棒棒鸡", time: 20 }, { name: "蒜泥白肉", time: 20 },
      { name: "口水鸡", time: 25 }, { name: "凉拌毛肚", time: 15 }
    ],
    soup: [
      { name: "酸萝卜老鸭汤", time: 60 }, { name: "番茄牛腩汤", time: 50 },
      { name: "酸辣汤", time: 15 }, { name: "酸菜鱼汤", time: 25 },
      { name: "豆花鱼汤", time: 20 }
    ]
  },

  "粤菜": {
    hard: [
      { name: "白切鸡", time: 35 }, { name: "烧鹅", time: 90 },
      { name: "脆皮烧肉", time: 80 }, { name: "豉汁蒸排骨", time: 25 },
      { name: "清蒸石斑鱼", time: 20 }, { name: "蜜汁叉烧", time: 50 },
      { name: "盐焗鸡", time: 60 }, { name: "菠萝咕噜肉", time: 20 },
      { name: "白灼虾", time: 10 }
    ],
    fastMeat: [
      { name: "滑蛋牛肉", time: 10 }, { name: "姜葱炒蟹", time: 20 },
      { name: "豉椒炒蛤蜊", time: 10 }, { name: "蚝油牛肉", time: 12 },
      { name: "XO酱炒带子", time: 10 }, { name: "干炒牛河", time: 10 },
      { name: "清蒸鲈鱼", time: 15 }, { name: "椒盐九肚鱼", time: 15 },
      { name: "豉汁凤爪", time: 30 }, { name: "咸蛋黄焗虾", time: 15 },
      { name: "避风塘炒蟹", time: 20 }, { name: "梅菜蒸肉饼", time: 20 },
      { name: "煎酿三宝", time: 25 }, { name: "椒盐虾", time: 15 },
      { name: "蒸水蛋", time: 10 }
    ],
    veg: [
      { name: "蚝油生菜", time: 5 }, { name: "白灼菜心", time: 5 },
      { name: "蒜蓉炒通菜", time: 5 }, { name: "鲍汁扣西蓝花", time: 10 },
      { name: "上汤浸时蔬", time: 8 }, { name: "干炒牛河(素)", time: 10 },
      { name: "蒸酿豆腐", time: 20 }, { name: "XO酱炒芥蓝", time: 8 },
      { name: "腐乳通菜", time: 5 }
    ],
    cold: [
      { name: "白云凤爪", time: 30 }, { name: "蜜汁烧味拼盘", time: 20 },
      { name: "凉拌海蜇", time: 10 }, { name: "盐水毛豆", time: 15 },
      { name: "话梅花生", time: 15 }
    ],
    soup: [
      { name: "老火靓汤", time: 90 }, { name: "花生猪脚汤", time: 70 },
      { name: "虫草花鸡汤", time: 60 }, { name: "冬瓜薏米汤", time: 50 },
      { name: "西洋菜猪骨汤", time: 60 }, { name: "胡椒猪肚鸡", time: 70 },
      { name: "莲藕排骨汤", time: 60 }
    ]
  },

  "日料": {
    hard: [
      { name: "日式咖喱饭", time: 40 }, { name: "寿喜烧", time: 30 },
      { name: "炸猪排", time: 25 }, { name: "照烧鸡腿", time: 25 },
      { name: "日式炖肉(肉じゃが)", time: 40 }, { name: "鳗鱼饭", time: 30 },
      { name: "天妇罗拼盘", time: 30 }, { name: "日式汉堡肉", time: 25 }
    ],
    fastMeat: [
      { name: "三文鱼刺身", time: 10 }, { name: "金枪鱼刺身", time: 10 },
      { name: "日式煎饺", time: 15 }, { name: "味噌烤鱼", time: 20 },
      { name: "日式炒乌冬", time: 12 }, { name: "亲子丼", time: 15 },
      { name: "牛丼", time: 15 }, { name: "章鱼小丸子", time: 20 },
      { name: "盐烤秋刀鱼", time: 15 }, { name: "日式厚蛋烧", time: 10 },
      { name: "味噌猪排", time: 20 }, { name: "日式炸鸡(唐扬)", time: 20 }
    ],
    veg: [
      { name: "日式凉拌豆腐", time: 5 }, { name: "味噌茄子", time: 12 },
      { name: "日式土豆沙拉", time: 15 }, { name: "醋拌海带", time: 5 },
      { name: "日式煮南瓜", time: 15 }, { name: "芝麻菠菜", time: 8 },
      { name: "炸蔬菜天妇罗", time: 15 }, { name: "日式渍物拼盘", time: 5 }
    ],
    cold: [
      { name: "毛豆(枝豆)", time: 8 }, { name: "日式腌黄瓜", time: 5 },
      { name: "章鱼沙拉", time: 10 }, { name: "日式冷奴豆腐", time: 3 },
      { name: "芥末章鱼", time: 5 }
    ],
    soup: [
      { name: "味噌汤", time: 10 }, { name: "豚骨拉面", time: 30 },
      { name: "味噌拉面", time: 25 }, { name: "日式茶碗蒸", time: 20 },
      { name: "蛤蜊味噌汤", time: 12 }, { name: "豆腐海带汤", time: 8 }
    ]
  },

  "韩餐": {
    hard: [
      { name: "韩式烤肉", time: 30 }, { name: "部队锅", time: 25 },
      { name: "参鸡汤", time: 70 }, { name: "辣炖鸡", time: 35 },
      { name: "猪骨土豆汤", time: 50 }, { name: "安东炖鸡", time: 40 },
      { name: "韩式炸鸡", time: 30 }, { name: "铁板鸡", time: 25 }
    ],
    fastMeat: [
      { name: "韩式拌饭", time: 20 }, { name: "泡菜炒饭", time: 10 },
      { name: "韩式煎饼", time: 15 }, { name: "辣炒年糕", time: 12 },
      { name: "芝士辣炒鸡", time: 20 }, { name: "韩式牛肉饼", time: 15 },
      { name: "酱烤五花肉", time: 15 }, { name: "蛋包饭(韩式)", time: 15 },
      { name: "韩式炒杂菜", time: 20 }, { name: "辣炒猪肉", time: 12 }
    ],
    veg: [
      { name: "韩式辣白菜", time: 5 }, { name: "韩式凉拌豆芽", time: 8 },
      { name: "凉拌菠菜", time: 8 }, { name: "韩式土豆饼", time: 15 },
      { name: "辣拌萝卜", time: 8 }, { name: "韩式炒年糕", time: 12 },
      { name: "紫菜包饭", time: 20 }
    ],
    cold: [
      { name: "韩式腌萝卜", time: 10 }, { name: "橡子凉粉", time: 10 },
      { name: "凉拌蕨菜", time: 10 }, { name: "韩式蒸蛋", time: 12 },
      { name: "凉拌海鲜", time: 15 }
    ],
    soup: [
      { name: "大酱汤", time: 15 }, { name: "泡菜汤", time: 15 },
      { name: "海带汤", time: 20 }, { name: "牛尾汤", time: 80 },
      { name: "嫩豆腐汤", time: 15 }, { name: "韩式辣鱼汤", time: 25 }
    ]
  },

  "西餐": {
    hard: [
      { name: "煎牛排", time: 20 }, { name: "烤羊排", time: 40 },
      { name: "红酒炖牛肉", time: 90 }, { name: "奶油蘑菇鸡", time: 35 },
      { name: "意式肉酱千层面", time: 60 }, { name: "烤全鸡", time: 70 },
      { name: "惠灵顿牛排", time: 80 }, { name: "BBQ猪肋排", time: 60 }
    ],
    fastMeat: [
      { name: "意大利肉酱面", time: 25 }, { name: "奶油培根意面", time: 20 },
      { name: "蒜香黄油虾", time: 12 }, { name: "煎三文鱼", time: 15 },
      { name: "凯撒沙拉(鸡)", time: 15 }, { name: "牛肉汉堡", time: 20 },
      { name: "鸡肉卷饼", time: 15 }, { name: "黑椒鸡胸", time: 15 },
      { name: "香煎鳕鱼", time: 15 }, { name: "培根芝士焗土豆", time: 25 },
      { name: "奶油蘑菇意面", time: 20 }, { name: "柠檬香草鸡腿", time: 25 }
    ],
    veg: [
      { name: "凯撒沙拉", time: 10 }, { name: "希腊沙拉", time: 8 },
      { name: "奶油蘑菇汤配面包", time: 20 }, { name: "烤蔬菜拼盘", time: 20 },
      { name: "芝士焗西蓝花", time: 20 }, { name: "蒜香面包", time: 10 },
      { name: "土豆泥", time: 15 }, { name: "黄油炒芦笋", time: 8 },
      { name: "番茄莫扎瑞拉", time: 5 }
    ],
    cold: [
      { name: "尼斯沙拉", time: 15 }, { name: "西班牙凉菜汤", time: 10 },
      { name: "烟熏三文鱼拼盘", time: 5 }, { name: "意式沙拉", time: 8 },
      { name: "鹰嘴豆泥", time: 10 }
    ],
    soup: [
      { name: "奶油蘑菇汤", time: 25 }, { name: "法式洋葱汤", time: 40 },
      { name: "番茄浓汤", time: 20 }, { name: "南瓜浓汤", time: 25 },
      { name: "罗宋汤", time: 35 }, { name: "玉米浓汤", time: 20 }
    ]
  },

  "东南亚": {
    hard: [
      { name: "泰式绿咖喱鸡", time: 30 }, { name: "马来沙爹鸡", time: 30 },
      { name: "新加坡辣椒蟹", time: 25 }, { name: "越南炖牛肉", time: 50 },
      { name: "仁当牛肉", time: 60 }, { name: "红咖喱虾", time: 25 },
      { name: "海南鸡饭", time: 40 }, { name: "泰式烤鱼", time: 30 }
    ],
    fastMeat: [
      { name: "泰式炒河粉", time: 15 }, { name: "越南春卷", time: 15 },
      { name: "泰式打抛猪肉饭", time: 12 }, { name: "新加坡炒米粉", time: 15 },
      { name: "越南米纸卷", time: 10 }, { name: "泰式炒虾", time: 12 },
      { name: "印尼炒饭", time: 15 }, { name: "黄咖喱鸡", time: 20 },
      { name: "椰浆饭", time: 25 }, { name: "泰式柠檬鱼", time: 20 },
      { name: "咖喱角", time: 20 }, { name: "叻沙炒面", time: 15 }
    ],
    veg: [
      { name: "泰式凉拌青木瓜", time: 10 }, { name: "椰汁南瓜", time: 15 },
      { name: "泰式炒空心菜", time: 8 }, { name: "咖喱蔬菜", time: 15 },
      { name: "越南腌菜", time: 5 }, { name: "印尼天贝", time: 12 },
      { name: "泰式玉米饼", time: 12 }
    ],
    cold: [
      { name: "泰式凉拌海鲜", time: 15 }, { name: "越南冷面", time: 12 },
      { name: "泰式酸辣沙拉", time: 10 }, { name: "椰子冻", time: 10 }
    ],
    soup: [
      { name: "冬阴功汤", time: 20 }, { name: "越南河粉", time: 30 },
      { name: "叻沙", time: 25 }, { name: "椰汁鸡汤", time: 25 },
      { name: "泰式酸辣虾汤", time: 20 }, { name: "南姜鸡汤", time: 25 }
    ]
  }
};

export default MENU_DB;
