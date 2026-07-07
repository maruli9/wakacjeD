let currentCity = 
localStorage.getItem("city") || "essling";
let temperatureChart;



const weather = {


essling: {

name:"🇦🇹 Wien Essling",

temperature:"18°C",

feels:"16°C",

wind:"12 km/h",

rain:"20%",

pressure:"1015 hPa",

humidity:"55%",

sunrise:"05:18",

sunset:"20:42",

report:
"Dzisiaj przyjemny dzień. Możliwy lekki deszcz po południu.",


forecast: {

days:[
"Dzisiaj",
"Jutro",
"Czwartek",
"Piątek"
],

temps:[
18,
22,
25,
21
]

}

},



dziwnow:{


name:"🇵🇱 Dziwnów",

temperature:"21°C",

feels:"20°C",

wind:"18 km/h",

rain:"10%",

pressure:"1018 hPa",

humidity:"70%",

sunrise:"04:51",

sunset:"21:05",

report:
"Dobry dzień na spacer nad morzem.",


forecast:{

days:[
"Dzisiaj",
"Jutro",
"Czwartek",
"Piątek"
],

temps:[
21,
23,
19,
24
]

}

}

};




function loadWeather(){


let city = weather[currentCity];


document.getElementById("cityName").innerHTML =
city.name;


document.getElementById("temperature").innerHTML =
city.temperature;


document.getElementById("feels").innerHTML =
city.feels;


document.getElementById("wind").innerHTML =
city.wind;


document.getElementById("rain").innerHTML =
city.rain;


document.getElementById("pressure").innerHTML =
city.pressure;


document.getElementById("humidity").innerHTML =
city.humidity;


document.getElementById("sunrise").innerHTML =
city.sunrise;


document.getElementById("sunset").innerHTML =
city.sunset;


document.getElementById("report").innerHTML =
city.report;


}


function createChart(){


let city = weather[currentCity];


let ctx =
document
.getElementById("temperatureChart")
.getContext("2d");



if(temperatureChart){

temperatureChart.destroy();

}



temperatureChart =
new Chart(ctx, {


type:"line",


data:{


labels:
city.forecast.days,


datasets:[{


data:
city.forecast.temps,


borderWidth:2,


tension:0.4,


pointRadius:5,


fill:false


}]


},



options:{


responsive:true,


maintainAspectRatio:false,


plugins:{


legend:{


display:false


}


},



scales:{


y:{


beginAtZero:false,


ticks:{


font:{


size:12


}


}


},


x:{


ticks:{


font:{


size:12


}


}


}


}



}


});



}


function changeCity(city){

currentCity=city;

localStorage.setItem(
"city",
city
);

loadWeather();

createChart();

}




function clock(){

let now=new Date();

document.getElementById("clock").innerHTML =
now.toLocaleString("pl-PL");


}


setInterval(clock,1000);

clock();


loadWeather();





function addEvent(){


let text =
prompt("Wpisz wydarzenie");


if(text){

localStorage.setItem(
"event",
text
);


document.getElementById("schedule").innerHTML =
text;


}

}


let saved =
localStorage.getItem("event");


if(saved){

document.getElementById("schedule").innerHTML =
saved;

}

function setTheme(theme){


document.body.classList.remove(
"night"
);


if(theme==="night"){

document.body.classList.add(
"night"
);

}


localStorage.setItem(
"theme",
theme
);


}



let savedTheme =
localStorage.getItem("theme");


if(savedTheme==="night"){

document.body.classList.add(
"night"
);

}
createChart();