export const CATEGORIES = [
  { id: "textbooks", name: "Textbooks & Notes", icon: "BookOpen", description: "Engineering, Science, Commerce, and Arts books" },
  { id: "electronics", name: "Electronics & Gadgets", icon: "Laptop", description: "Laptops, phones, monitors, chargers, headphones" },
  { id: "calculators", name: "Scientific Calculators", icon: "Calculator", description: "Casio fx-991, graphic and financial calculators" },
  { id: "stationery", name: "Stationery & Drafting", icon: "PenTool", description: "Mini drafters, sheet holders, compass sets, markers" },
  { id: "cycles", name: "Cycles & Mobility", icon: "Bike", description: "Bicycles, gear locks, skateboards" },
  { id: "hostel-essentials", name: "Hostel Essentials & Furniture", icon: "Home", description: "Mattresses, study tables, lamps, kettles, irons" },
  { id: "accessories", name: "Bags & Accessories", icon: "Briefcase", description: "Backpacks, laptop sleeves, gym bags, umbrellas" },
  { id: "fashion", name: "Campus Clothing & Uniforms", icon: "Shirt", description: "Lab coats, hoodies, college jackets, sports gear" },
] as const;

export const ITEM_CONDITIONS = [
  { value: "Brand New", label: "Brand New (Unopened / Never Used)" },
  { value: "Like New", label: "Like New (Barely used, flawless condition)" },
  { value: "Good", label: "Good (Fully functional, minor cosmetic wear)" },
  { value: "Fair", label: "Fair (Visible wear, works as intended)" },
] as const;

export const DEFAULT_COLLEGES = [
  { name: "Indian Institute of Technology (IIT) Delhi", domain: "iitd.ac.in", city: "New Delhi" },
  { name: "Delhi Technological University (DTU)", domain: "dtu.ac.in", city: "Delhi" },
  { name: "Netaji Subhas University of Technology (NSUT)", domain: "nsut.ac.in", city: "Delhi" },
  { name: "Birla Institute of Technology and Science (BITS) Pilani", domain: "pilani.bits-pilani.ac.in", city: "Pilani" },
  { name: "Indian Institute of Information Technology (IIIT) Delhi", domain: "iiitd.ac.in", city: "Delhi" },
  { name: "National Institute of Technology (NIT) Trichy", domain: "nitt.edu", city: "Tiruchirappalli" },
  { name: "Vellore Institute of Technology (VIT)", domain: "vit.ac.in", city: "Vellore" },
  { name: "Manipal Institute of Technology (MIT)", domain: "manipal.edu", city: "Manipal" },
  { name: "Heritage Institute of Technology", domain: "heritageit.edu", city: "Kolkata" },
  { name: "Universal College Campus", domain: "campus.edu", city: "General Campus" }
] as const;

export const ACADEMIC_YEARS = [
  "1st Year (Freshman)",
  "2nd Year (Sophomore)",
  "3rd Year (Junior)",
  "4th Year (Senior)",
  "Postgraduate / Masters",
  "PhD / Doctoral Scholar"
] as const;
