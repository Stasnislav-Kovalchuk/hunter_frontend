export const menuData = {
  kitchen: {
    title: "Кухня",
    subcategories: [
      {
        name: "Основні страви",
        items: [
          { id: 101, name: "Картопля смажена", price: 229, weight: "350 г", desc: "Золотиста картопля, смажена з цибулею та спеціями", img: "potatoes.png" },
          { id: 102, name: "Деруни зі сметаною", price: 345, weight: "400 г", desc: "Традиційні деруни з тертої картоплі, смажені до хрусткої скоринки", img: "deruny.png" },
          { id: 103, name: "Стейк зі свинини", price: 450, weight: "250/50 г", desc: "Соковита свиняча шия на грилі з соусом BBQ", img: "steak.png" },
          { id: 104, name: "Вареники з м'ясом", price: 180, weight: "300 г", desc: "Домашні вареники з піджаркою із сала та цибулі", img: "varenyky.png" }
        ]
      },
      {
        name: "Закуски",
        items: [
          { id: 105, name: "М'ясна тарілка", price: 320, weight: "450 г", desc: "Шинка, балик, домашня ковбаса та бочок", img: "meat.png" },
          { id: 106, name: "Оселедець з цибулею", price: 150, weight: "200/50 г", desc: "Філе оселедця з маринованою цибулею та грінками", img: "herring.png" },
          { id: 107, name: "Сало з часником", price: 120, weight: "150/30 г", desc: "Тонко нарізане сало з житнім хлібом та гірчицею", img: "salo.png" }
        ]
      },
      {
        name: "Гарячі закуски",
        items: [
          { id: 108, name: "Крила BBQ", price: 210, weight: "300 г", desc: "Курячі крильця в гостро-солодкому соусі", img: "wings.png" },
          { id: 109, name: "Сирні палички", price: 165, weight: "200 г", desc: "Обсмажений сир моцарела з журавлинним соусом", img: "cheese_sticks.png" }
        ]
      }
    ]
  },
  bar: {
    title: "Бар",
    subcategories: [
      {
        name: "Пиво",
        items: [
          { id: 201, name: "Хмелевус Light", price: 85, weight: "0.5 л", desc: "Світле фільтроване", img: "beer1.png" },
          { id: 202, name: "Grimbergen Double", price: 110, weight: "0.5 л", desc: "Темне аббатське пиво", img: "beer2.png" }
        ]
      },
      {
        name: "Вино",
        items: [
          { id: 203, name: "Chardonnay", price: 450, weight: "0.75 л", desc: "Біле сухе, Італія", img: "wine1.png" },
          { id: 204, name: "Merlot", price: 480, weight: "0.75 л", desc: "Червоне сухе, Франція", img: "wine2.png" }
        ]
      },
      {
        name: "Міцний алкоголь",
        items: [
          { id: 205, name: "Jameson", price: 95, weight: "50 мл", desc: "Ірландське віскі", img: "whiskey.png" },
          { id: 206, name: "Absolut Vodka", price: 65, weight: "50 мл", desc: "Класична горілка", img: "vodka.png" }
        ]
      },
      {
        name: "Безалкогольні",
        items: [
          { id: 207, name: "Coca-Cola", price: 45, weight: "0.5 л", desc: "В асортименті", img: "cola.png" },
          { id: 208, name: "Моршинська", price: 35, weight: "0.5 л", desc: "Газована / слабогазована", img: "water.png" }
        ]
      }
    ]
  },
  breakfast: {
    title: "Сніданки",
    subcategories: [
      {
        name: "Класичні сніданки",
        items: [
          { id: 301, name: "Англійський сніданок", price: 215, weight: "400 г", desc: "Яєчня, бекон, квасоля, ковбаски та тости", img: "english_bf.png" },
          { id: 302, name: "Омлет з сиром", price: 140, weight: "250 г", desc: "Ніжний омлет з трьох яєць та сиром Гауда", img: "omlet.png" },
          { id: 303, name: "Сирники з медом", price: 160, weight: "220/30 г", desc: "Домашній сир, обсмажений до золотої скоринки", img: "syrnyky.png" }
        ]
      }
    ]
  },
  desserts: {
    title: "Десерти",
    subcategories: [
      {
        name: "Торти",
        items: [
          { id: 401, name: "Чізкейк Classic", price: 145, weight: "150 г", desc: "Класичний сирний десерт на пісочній основі", img: "cheesecake.png" },
          { id: 402, name: "Наполеон", price: 125, weight: "180 г", desc: "Листкове тісто з ніжним заварним кремом", img: "napoleon.png" }
        ]
      },
      {
        name: "Морозиво",
        items: [
          { id: 403, name: "Пломбір з фруктами", price: 95, weight: "150/50 г", desc: "Три кульки морозива з сезонними фруктами", img: "icecream.png" }
        ]
      }
    ]
  }
};