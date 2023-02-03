let foods=document.querySelector("#foods");
let query=document.querySelector("#query");
let brand=document.querySelector("#brand");
let data=document.querySelector("#data");
let debug_view=document.querySelector("#debug");
let debug={};

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

function renderFoods() {
}

function addFood(id) {
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
    a+=`<button onclick="addFood(${food.fdcId})">Add Food</button>`
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
