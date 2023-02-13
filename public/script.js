let foods=document.querySelector("#foods");
let total_nutrients=document.querySelector("#total_nutrients");
let query=document.querySelector("#query");
let brand=document.querySelector("#brand");
let data=document.querySelector("#data");
let results_box=document.querySelector("#results-box");
let download_button=document.querySelector("#download_button");
let number_box=document.querySelector("#number-box");
let currentFoods=[];
let loading=0;

let rdvs={
  "Calcium, Ca": 1166,
  "Carbohydrate, by difference": 300,
  "Energy": 2000,
  "Fatty acids, total saturated": 18.75,
  "Fiber, total dietary": 28,
  "Iron, Fe": 18,
  "Protein": 71,
  "Sodium, Na": 2318,
  "Total lipid (fat)": 75
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function renderFoodItem(food) {
  let a="";
  a+="<div class='description'>"+toTitleCase(food.description)+"</div>";

  if (food.dataType=="Branded") {
    a+="<div class='servingSize'>"+food.servingSize+food.servingSizeUnit+"</div>";
    a+="<div class='brand'>"+food.brandOwner+"</div>";
  }
  a+="<div class='servings'>"+food.foodNutrients.serving_size+" serving(s)</div>";
  a+="<div class='ingredients noshow' onclick='this.classList.toggle(\"noshow\")'><span style='color:green'>+</span> Ingredients<div><div>"+food.ingredients+"</div></div></div>";

  a+="<div class='nutrients noshow' onclick='this.classList.toggle(\"noshow\")'><span style='color:green'>+</span> Nutrients";

  for (let nutrient of food.foodNutrients) {
    a+="<div><pre>"+JSON.stringify(nutrient, null, 2)+"</pre></div>";
  }
  a+="</div>";

  a+="<div class='raw_data noshow' onclick='this.classList.toggle(\"noshow\")'><span style='color:green'>+</span> Raw Data<div><pre>"+JSON.stringify(food, null, 2)+"</pre></div></div>";
  a+=`<div class="fdc-id-label">${food.fdcId}</div>`

  return a;
}

function clear_selection() {
  currentFoods=[];
  renderFoods();
}

function show_nutrition_information() {
  let e=document.querySelector("#nutrition-information");
  e.classList.toggle("hidden");
}

function importFoods(input) {
  let file = input.files[0];

  let reader = new FileReader();
  reader.readAsText(file);

  reader.onload = function() {

    currentFoods=JSON.parse(reader.result);
    renderFoods();
  };

  reader.onerror = function() {
    alert("File import failed.");
  };
}

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

function setServings(idx) {
  let size=Number.parseFloat(prompt("Enter the amount of servings."));

  if (!Number.isNaN(size)) {
    currentFoods[idx].foodNutrients.serving_size=size;
  }
}

function renderFoods() {
  foods.innerHTML="";

  let nutrients=[];

  for (let idx in currentFoods) {
    let food=currentFoods[idx];

    if (!food.foodNutrients) {
      food.foodNutrients=[];
    }

    if (!food.foodNutrients.serving_size) {
      food.foodNutrients.serving_size = 1.0;
    }

    nutrients.push(food.foodNutrients);

    let a="<div class='item'>"
    a+=renderFoodItem(food);

    a+="<div class=\"config-buttons\">"
    a+=`<button class="serving-button" onclick="setServings(${idx}); renderFoods()">Servings</button>`
    a+=`<button class="remove-button" onclick="currentFoods.splice(${idx}, 1); renderFoods()">Remove</button>`
    a+="</div>"

    a+="</div>"

    foods.innerHTML+=a;

    let savedFoods=currentFoods.map(e=>{return e.fdcId});
    document.cookie=`savedFoods=${JSON.stringify(savedFoods)};`;
  }

  let totals={};
  for (let food of nutrients) {
    for (let nutrient of food) {
      if (!totals[nutrient.nutrient.name]) {
        totals[nutrient.nutrient.name]={"value": 0};
      }

      totals[nutrient.nutrient.name].value+=nutrient.amount*food.serving_size;
      totals[nutrient.nutrient.name].unit=nutrient.nutrient.unitName;
      if (rdvs[nutrient.nutrient.name]) {
        totals[nutrient.nutrient.name].recommended=rdvs[nutrient.nutrient.name];
        totals[nutrient.nutrient.name].percent=totals[nutrient.nutrient.name].value/totals[nutrient.nutrient.name].recommended;
      }
    }
  }

  let a="";
  a+="<div id='nutrition-information' class='nutrition-information-container hidden' onclick='this.classList.toggle(\"hidden\")'>";
  a+="<div class='nutrition-information'>";
  a+="<span class='header'><b>Nutrient</b></span>";
  a+="<span class='header'><b>Total Amount</b></span>";
  a+="<span class='header'><b>% Daily Value</b></span>";

  let keys=[];
  for (let key in totals) {
    keys.push(key);
  }

  keys.sort();

  for (let key of keys) {
    a+=`<span class='row'>${key}</span>`;
    a+=`<span class='row'>${(Math.round(totals[key].value * 100) / 100).toFixed(2)}`;
    if (totals[key].unit) {
      a+=` ${totals[key].unit}`;
    }
    a+="</span>";

    if (totals[key].percent) {
      a+=`<span class='row'>${(Math.round(totals[key].percent * 10000) / 100).toFixed(2)}%</span>`;
    } else {
      a+="<span class='row'></span>";
    }
  }
  a+="</div>";
  a+="</div>";

  total_nutrients.innerHTML=a;

  if (loading>0) {
    foods.innerHTML+="<div><b>Loading, please wait...</b></div>";
  }
}

function addFood(id) {
  document.documentElement.scrollTo({"top":0,"behavior":"smooth"});

  loading+=1;

  renderFoods();

  fetch(`/api?id=${id}`)
    .then((response) => response.json())
    .then((food) => {
      currentFoods.push(food);
      loading-=1;
      renderFoods();

      var file = new Blob([JSON.stringify(currentFoods, null, 2)], {type: "text/json"});
      download_button.href = URL.createObjectURL(file);
      download_button.download = "food_export.json";
    });
}

function renderData(e) {
  let a=""
  results_box.innerHTML="<span class='hits'>Results: "+e.foods.length+" of "+e.hits+"</span>";

  for (let food of e.foods) {

    if (!food.foodNutrients) {
      food.foodNutrients=[];
    }

    if (!food.foodNutrients.serving_size) {
      food.foodNutrients.serving_size = 1.0;
    }

    a+="<div class='item'>"
    a+=renderFoodItem(food);
    a+=`<button class="add-button" onclick="addFood(${food.fdcId})">Add Food</button>`
    a+="</div>"
  }

  data.innerHTML=a;
}

function submitQuery() {
  data.innerHTML+="<div><b>Loading, please wait...</b></div>";

  let pageNumber=number_box.value;
  if (!pageNumber) {
    pageNumber=1;
  }

  number_box.value=pageNumber;

  fetch(`/api?q="${query.value}"&p=${pageNumber}&brand=${brand.value}`)
    .then((response) => response.json())
    .then((d) => {
      let l={
        hits:d.totalHits,
        foods:d.foods.map(e=>{
          return {
            fdcId: e.fdcId,
            description: e.lowercaseDescription,
            brand: e.brandOwner,
            ingredients: e.ingredients,
            servingSize: e.servingSize+e.servingSizeUnit,
            nutrients: e.foodNutrients.map(e=>{
              return e.nutrientName+": "+e.value+e.unitName
            })
          }
        })
      }
      renderData(l);
    });
}

query.addEventListener("keyup", (e)=>{
  if (e.key=="Enter"){
    submitQuery();
  }
});

brand.addEventListener("keyup", (e)=>{
  if (e.key=="Enter"){
    submitQuery();
  }
});

for (let id of JSON.parse(getCookie("savedFoods"))) {
  addFood(id);
}
