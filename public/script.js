let foods=document.querySelector("#foods");
let total_nutrients=document.querySelector("#total_nutrients");
let query=document.querySelector("#query");
let brand=document.querySelector("#brand");
let data=document.querySelector("#data");
let debug_view=document.querySelector("#debug");
let debug={};
let currentFoods=[];

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

function setServings(idx) {
  currentFoods[idx].foodNutrients.serving_size=2.0;
}

function renderFoods() {
  foods.innerHTML="";

  let nutrients=[];

  for (let idx in currentFoods) {
    let food=currentFoods[idx];

    if (!food.foodNutrients.serving_size) {
      food.foodNutrients.serving_size = 1.0;
    }

    let a="";
    a+="<div class='item'>"
    a+="<div class='description'>"+toTitleCase(food.description)+"</div>";
    a+="<div class='servingSize'>"+food.servingSize+food.servingSizeUnit+"</div>";
    a+="<div class='servings'>"+food.foodNutrients.serving_size+" serving(s)</div>";
    a+="<div class='brand'>"+food.brandOwner+"</div>";
    a+="<div class='ingredients noshow' onclick='this.classList.toggle(\"noshow\")'><span style='color:green'>+</span> Ingredients<div><div>"+food.ingredients+"</div></div></div>";

    a+="<div class='nutrients noshow' onclick='this.classList.toggle(\"noshow\")'><span style='color:green'>+</span> Nutrients";

    nutrients.push(food.foodNutrients);

    for (let nutrient of food.foodNutrients) {
      a+="<div><pre>"+JSON.stringify(nutrient, null, 2)+"</pre></div>";
    }
    a+="</div>";

    a+="<div class='raw_data noshow' onclick='this.classList.toggle(\"noshow\")'><span style='color:green'>+</span> Raw Data<div><pre>"+JSON.stringify(food, null, 2)+"</pre></div></div>";
    a+="<div class=\"config-buttons\">"
    a+=`<button class="serving-button" onclick="setServings(${idx}); renderFoods()">Servings</button>`
    a+=`<button class="remove-button" onclick="currentFoods.splice(${idx}, 1); renderFoods()">Remove</button>`
    a+="</div>"
    a+="</div>"

    foods.innerHTML+=a;
  }

  total_nutrients.innerHTML="";
  let sum=0;
  for (let food of nutrients) {
    for (let nutrient of food) {
      if (nutrient.nutrient.name=="Energy") {
        let amt=nutrient.amount*food.serving_size;
        total_nutrients.innerHTML+=amt+" Calories<br>";
        sum+=amt;
      }
    }
  };
  total_nutrients.innerHTML+=sum+" Calories Total";
}

function addFood(id) {
  foods.innerHTML+="<div>Loading, please wait...</div>";

  fetch(`/api?id=${id}`)
    .then((response) => response.json())
    .then((food) => {
      currentFoods.push(food);
      renderFoods();
    });
}

function renderData(e) {
  let a=""
  a+="<div class='hits'>Results: "+e.foods.length+" of "+e.hits+"</div>";

  for (let food of e.foods) {
    a+="<div class='item'>"
    a+="<div class='description'>"+toTitleCase(food.description)+"</div>";
    a+="<div class='servingSize'>"+food.servingSize+"</div>";
    a+="<div class='brand'>"+food.brand+"</div>";
    a+="<div class='ingredients noshow' onclick='this.classList.toggle(\"noshow\")'><span style='color:green'>+</span> Ingredients<div><div>"+food.ingredients+"</div></div></div>";

    a+="<div class='nutrients noshow' onclick='this.classList.toggle(\"noshow\")'><span style='color:green'>+</span> Nutrients";
    for (let nutrient of food.nutrients) {
      a+="<div>"+nutrient+"</div>";
    }
    a+="</div>";

    a+="<div class='raw_data noshow' onclick='this.classList.toggle(\"noshow\")'><span style='color:green'>+</span> Raw Data<div><pre>"+JSON.stringify(food, null, 2)+"</pre></div></div>";
    a+=`<button class="add-button" onclick="addFood(${food.fdcId})">Add Food</button>`
    a+="</div>"
  }

  data.innerHTML=a;
  debug_view.innerHTML=JSON.stringify(e, null, 2);
}

function submitQuery() {
  fetch(`/api?q="${query.value}"&p=1&brand=${brand.value}`)
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
      debug=d;
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
