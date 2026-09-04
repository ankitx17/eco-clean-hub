/* =========================================================
   Eco Clean Hub
   Verified Waste Recovery Facilities

   Important:
   - Only verified/authorized facility records are stored here.
   - Coordinates are intentionally null until independently
     verified from a reliable mapping/geocoding source.
   - Do not guess latitude/longitude.
========================================================= */

const verifiedFacilities = [
  {
    id: "ewri-okhla",
    name: "E-Waste Recyclers India",
    type: "E-Waste Recycler",

    address:
      "A-46, Okhla Industrial Area, Phase-I, New Delhi - 110020",

    city: "New Delhi",
    state: "Delhi",

    acceptedWaste: [
      "E-Waste",
      "Electronics",
      "IT Equipment",
      "Batteries",
    ],

    status: "Verified",

    source:
      "Official Facility Website",

    verified: true,

    latitude: null,
    longitude: null,
  },

  {
    id: "muskan-technologies",
    name: "Muskan Technologies",
    type: "E-Waste Recycler",

    address:
      "B-96, Okhla Industrial Area, Phase-1, Delhi - 110020",

    city: "Delhi",
    state: "Delhi",

    acceptedWaste: [
      "E-Waste",
      "Electronics",
      "IT Equipment",
    ],

    status: "Verified",

    source:
      "NDMC / CPCB Approved List",

    verified: true,

    latitude: null,
    longitude: null,
  },

  {
    id: "shivnath-computers",
    name: "Shivnath Computers",
    type: "E-Waste Recycler",

    address:
      "E-47/2, 1st Floor, Okhla Phase-2, Delhi - 110019",

    city: "Delhi",
    state: "Delhi",

    acceptedWaste: [
      "E-Waste",
      "Computers",
      "Electronics",
      "IT Equipment",
    ],

    status: "Verified",

    source:
      "NDMC / CPCB Approved List",

    verified: true,

    latitude: null,
    longitude: null,
  },

  {
    id: "techchef-ewaste",
    name:
      "Techchef E-Waste Solutions Pvt. Ltd.",

    type: "E-Waste Recycler",

    address:
      "C-61, DDA Shed, Okhla Industrial Area, Phase-1, New Delhi - 110020",

    city: "New Delhi",
    state: "Delhi",

    acceptedWaste: [
      "E-Waste",
      "Electronics",
      "IT Equipment",
    ],

    status: "Verified",

    source:
      "NDMC / CPCB Approved List",

    verified: true,

    latitude: null,
    longitude: null,
  },

  {
    id: "greenscape-eco",
    name:
      "Greenscape Eco Management Pvt. Ltd.",

    type: "E-Waste Recycler",

    address:
      "348, Patparganj Industrial Area, Delhi",

    city: "Delhi",
    state: "Delhi",

    acceptedWaste: [
      "E-Waste",
      "Electronics",
      "Batteries",
    ],

    status: "Verified",

    source:
      "NDMC / CPCB Approved List",

    verified: true,

    latitude: null,
    longitude: null,
  },

  {
    id: "shree-raman-ewaste",
    name: "Shree Raman E-Waste",

    type: "E-Waste Recycler",

    address:
      "Plot No. 7, Khasra No. 487, Peeragarhi Industrial Area, Delhi - 110087",

    city: "Delhi",
    state: "Delhi",

    acceptedWaste: [
      "E-Waste",
      "Electronics",
      "IT Equipment",
    ],

    status: "Verified",

    source:
      "NDMC / CPCB Approved List",

    verified: true,

    latitude: null,
    longitude: null,
  },

  {
    id: "fozia-traders",
    name: "Fozia Traders",

    type: "E-Waste Recycler",

    address:
      "Khasra No. 13/1, Saboli Mandoli Industrial Area, Delhi - 110093",

    city: "Delhi",
    state: "Delhi",

    acceptedWaste: [
      "E-Waste",
      "Electronics",
    ],

    status: "Verified",

    source:
      "NDMC / CPCB Approved List",

    verified: true,

    latitude: null,
    longitude: null,
  },
]

export default verifiedFacilities