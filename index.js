const express=require("express");
const app=express();
const port=8080;
const path=require("path");
const {v4:uuidv4}=require("uuid");
const mysql=require("mysql2");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'ecotrack',
  password:'Sumit@2005'
});

app.listen(port,()=>{
    console.log(`app is listening port ${port}`);
})
// app.get("/",(req,res)=>{
//     res.render("home.ejs");
// })
app.get("/login",(req,res)=>{
    res.render("login.ejs");
})
app.post("/login",(req,res)=>{
    let {name,password}=req.body;
    let q3=`SELECT * FROM users WHERE name='${name}' AND password='${password}'`
    if(name=="admin" && password=="admin123"){
        // res.redirect("/admin")
        res.send("admin");
    }else{
        try{
        connection.query(q3,(err,result)=>{
            if(err) throw err;
            let  user = result[0];
            // console.log(user.id);

            res.redirect(`/dashboard/${user.id}`);     
        })
        }catch(err){
             console.log(err);
         }
    }
    
    
});
app.get("/signUp",(req,res)=>{
    res.render("signUp.ejs");
})
app.post("/register",(req,res)=>{
    let id=uuidv4();
    let {name,email,password}=req.body;
    let q="INSERT INTO users (id,name,email,password) VALUES (?,?,?,?)";
    let q2=`INSERT INTO footprints (user_id,electronics,vehicles,meals,electricity,waste,totalCO2) VALUES (?,?,?,?,?,?,?)`;
    let user=[id,name,email,password];
    try{
        connection.query(q,user,(err,result)=>{
            if(err) throw err;
            connection.query(q2,[id,0,0,0,0,0,0],(err,result)=>{
                res.redirect("/login");
            })
        })
    }catch(err){
        console.log(err);
    }
})
app.get("/dashboard/:id",(req,res)=>{
    let {id}=req.params;
    q4=`SELECT * FROM footprints WHERE user_id='${id}' ORDER BY date DESC LIMIT 7;`;
    q5=`SELECT * FROM users WHERE id='${id}'`;
    try{
        connection.query(q5,(err,users)=>{
            if(err) throw err;
            let user=users[0];
            connection.query(q4,(err,datas)=>{
                if(err) throw err;
                res.render("dashboard.ejs",{user,datas});
            })
        })
        
    }catch(err){
        console.log(err);
    }
    
    
})
app.get("/leaderboard",(req,res)=>{
    res.render("leaderboard.ejs");
})
let footprintData = {
  user_id: "user123",
  electronics: 0,
  vehicles: 0,
  meals: 0,
  waste: 0
};

//vehicles
const factors = {
  fourWheeler: {
    petrol: 2.31,
    diesel: 2.68,
    cng: 2.75,
    electric: 0.5
  },
  twoWheeler: {
    petrol: 2.1,
    electric: 0.4
  }
};
app.get("/calculate",(req,res)=>{
    res.render("calculate.ejs");
})
app.get("/vehicles/:id",(req,res)=>{
    let {id}=req.params;
    res.render("vehicles.ejs",{id});
})
app.post("/vehicles/:id",(req,res)=>{
    let {id}=req.params;
    const { vehicleType, fuel, distance, mileage } = req.body;

  if (!vehicleType || !fuel || !distance || !mileage) {
    return res.send("Please enter all fields correctly!");
  }
  const factor = factors[vehicleType][fuel];
  const carbonFootprint = (distance / mileage) * factor;
  footprintData.vehicles=carbonFootprint.toFixed(2);
  res.redirect(`/meals/${id}`);
})

//meals
const mealFactors = {
  veg: {
    vegetables: 0.5,
    fruits: 0.3,
    grains: 0.4,
  },
  nonVeg: {
    chicken: 6.9,
    beef: 27.0,
    fish: 5.0,
    pork: 12.1,
  },
};

const cookingFactors = {
  raw: 1.0,
  boiled: 1.2,
  fried: 1.5,
  grilled: 1.8,
};
app.post("/meals/:id", (req, res) => {
    let {id}=req.params;
  const { dietType, foodType, cooking } = req.body;

  if (!dietType || !foodType || !cooking) {
    return res.send("⚠️ Please fill in all details.");
  }

  const baseFactor = mealFactors[dietType][foodType];
  const cookFactor = cookingFactors[cooking];
  const footprint = baseFactor * cookFactor;
  footprintData.meals=footprint.toFixed(2);
  res.redirect(`/electronics/${id}`)
})
app.get("/meals/:id",(req,res)=>{
    let {id}=req.params;
    res.render("meals.ejs",{id});
})

//electronics
const EMISSION_FACTOR = 0.82;
app.get("/electronics/:id",(req,res)=>{
    let {id}=req.params;
    res.render("electronics.ejs",{id});
})
app.post("/electronics/:id", (req, res) => {
    let {id}=req.params;
  const { deviceType, powerRating, usageHours } = req.body;

  if (!deviceType || !powerRating || !usageHours) {
    return res.send("⚠️ Please fill in all fields.");
  }

  const powerKW = parseFloat(powerRating) / 1000;
  const hours = parseFloat(usageHours);
  const totalCO2 = powerKW * hours * EMISSION_FACTOR;
  footprintData.electronics=totalCO2.toFixed(2);
  res.redirect(`/waste/${id}`);
})

//waste
const wasteData = {
  organic: 0.09,         // compostable food waste
  plastic: 6.00,         // high fossil-fuel impact
  paper: 1.70,
  metal: 2.50,
  glass: 1.40,
  e_waste: 6.50,
  textile: 4.00,
};
app.post("/waste/:id", (req, res) => {
    let {id}=req.params;
  const { wasteType, wasteAmount } = req.body;

  if (!wasteType || !wasteAmount) {
    return res.send("⚠️ Please fill in all fields.");
  }

  const emissionFactor = wasteData[wasteType];
  const amount = parseFloat(wasteAmount);

  const totalCO = emissionFactor * amount;
  footprintData.waste=totalCO.toFixed(2);
  const totalCO2 = 
  parseFloat(footprintData.electronics || 0) +
  parseFloat(footprintData.vehicles || 0) +
  parseFloat(footprintData.meals || 0) +
  parseFloat(footprintData.waste || 0);
    let q7=`INSERT INTO footprints (user_id,electronics,vehicles,meals,electricity,waste,totalCO2) VALUES (?,?,?,?,?,?,?)`;
    let data=[id,footprintData.electronics,footprintData.vehicles,footprintData.meals,0,footprintData.waste,totalCO2 ];
    connection.query(q7,data,(err,result)=>{
        if(err) throw err;
        res.redirect(`/dashboard/${id}`);
    })

})
app.get("/waste/:id",(req,res)=>{
    let {id}=req.params;
    res.render("waste.ejs",{id});
})
app.get("/",(req,res)=>{
    res.render("newhome.ejs");
})

