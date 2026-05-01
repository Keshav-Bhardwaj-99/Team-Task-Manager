# 📘 Team Task Manager: Samjhane wali Guide

Agar koi poochhe ki ye project kaise bana hai aur kaun si file kya karti hai, toh ye guide kaam aayegi.

---

## **1. Backend (Dimag) - Python Files**

- **`main.py` (The Boss):** 
    - Ye poore project ka main "Control Room" hai. 
    - Saare "Routes" (URL links) yahi bante hain (jaise `/login`, `/signup`, `/tasks`). 
    - Jab frontend koi request bhejta hai, toh `main.py` use handle karke batata hai kya karna hai.

- **`models.py` (Database ki Shakal):**
    - Isme humne bataya hai ki database mein tables kaisi dikhengi. 
    - User table, Project table, aur Task table ke beech ka "Rishta" (Relationship) yahi set hota hai.

- **`schemas.py` (Data ka Form):**
    - Ye check karta hai ki frontend se jo data aa raha hai wo sahi format mein hai ya nahi (e.g., email sahi hai ya nahi, password empty toh nahi hai).

- **`auth.py` (The Bodyguard):**
    - Iska kaam security hai. Login ke baad "Token" banana aur har request par check karna ki banda sahi hai ya nahi, ye isi ka kaam hai.

- **`database.py` (Connection):**
    - Ye file backend ko "Postgres Database" se jodne ka kaam karti hai.

---

## **2. Frontend (Shakal) - React Files**

- **`src/api.js` (The Bridge):**
    - **Sabse Zaroori File!** Ye backend aur frontend ke beech ka "Rasta" hai. Humne yahan Railway ka link dala hai taaki frontend backend se baat kar sake.

- **`src/Dashboard.jsx` (Control Room UI):**
    - Ye sabse badi file hai frontend ki. Admin ko stats dikhana, naya task dena, aur members ke saath chat karna—sab isi file ke andar hota hai.

- **`src/Login.jsx` & `Signup.jsx`:**
    - Ye sirf login aur account banane wale pages hain.

- **`src/App.jsx`:**
    - Iska kaam ye decide karna hai ki kaun sa page kab khulega (Routing).

---

## **3. Connection Kaise Hota Hai? (Flow)**

1. **Frontend:** Jab tum Login button dabate ho, `Login.jsx` us data ko `api.js` ke zariye backend (`main.py`) ko bhejta hai.
2. **Backend:** `main.py` us data ko `auth.py` ke paas bhejta hai check karne ke liye. 
3. **Database:** Agar sab sahi hai, toh `database.py` ke zariye database se data nikal kar wapas frontend ko bhej diya jata hai.
4. **Token:** Login hone par ek "Token" milta hai jo frontend apne paas save kar leta hai, taaki baar-baar login na karna pade.

---

## **4. Advanced Features (Jo tum bata sakte ho):**

- **Dual Status System:** Member apna kaam "Completed" mark karta hai, par Admin use "Review" karke "Final Done" karta hai. Ye logic `main.py` aur `Dashboard.jsx` ke beech chalta hai.
- **Messaging:** Har task ke niche ek chat box hai, jiska data database mein `Comment` table mein save hota hai.
