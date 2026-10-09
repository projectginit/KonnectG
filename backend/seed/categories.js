import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/Category.js";

dotenv.config();

const categories = [
  {
    name: "Catering Services",
    slug: "catering-services",
    displayOrder: 1,
  },
  {
    name: "Tailors & Stitching Units",
    slug: "tailors-stitching-units",
    displayOrder: 2,
  },
  {
    name: "Shoe Stores / Footwear Retailers",
    slug: "shoe-stores-footwear-retailers",
    displayOrder: 3,
  },
  {
    name: "Beauty Parlors / Salons",
    slug: "beauty-parlors-salons",
    displayOrder: 4,
  },
  {
    name: "Men’s Grooming Studios / Barbershops",
    slug: "mens-grooming-studios-barbershops",
    displayOrder: 5,
  },
  {
    name: "Physiotherapy Centers",
    slug: "physiotherapy-centers",
    displayOrder: 6,
  },
  {
    name: "Furniture Stores",
    slug: "furniture-stores",
    displayOrder: 7,
  },
  {
    name: "Electrical & Hardware Stores",
    slug: "electrical-hardware-stores",
    displayOrder: 8,
  },
  {
    name: "Paint Shops",
    slug: "paint-shops",
    displayOrder: 9,
  },
  {
    name: "Bike / Car Garages",
    slug: "bike-car-garages",
    displayOrder: 10,
  },
  {
    name: "Spare Parts Dealers",
    slug: "spare-parts-dealers",
    displayOrder: 11,
  },
  {
    name: "Car Wash Centers",
    slug: "car-wash-centers",
    displayOrder: 12,
  },
  {
    name: "Repair & Servicing Centers",
    slug: "repair-servicing-centers",
    displayOrder: 13,
  },
  {
    name: "CCTV / Security System Dealers",
    slug: "cctv-security-system-dealers",
    displayOrder: 14,
  },
  {
    name: "Internet Service Providers",
    slug: "internet-service-providers",
    displayOrder: 15,
  },
  {
    name: "Printing / Xerox / Cyber Cafés",
    slug: "printing-xerox-cyber-cafes",
    displayOrder: 16,
  },
  {
    name: "Schools / Coaching Institutes",
    slug: "schools-coaching-institutes",
    displayOrder: 17,
  },
  {
    name: "Private Tutors",
    slug: "private-tutors",
    displayOrder: 18,
  },
  {
    name: "Skill Development Centers",
    slug: "skill-development-centers",
    displayOrder: 19,
  },
  {
    name: "Computer Training Institutes",
    slug: "computer-training-institutes",
    displayOrder: 20,
  },
  {
    name: "Dance / Music / Art Schools",
    slug: "dance-music-art-schools",
    displayOrder: 21,
  },
  {
    name: "Daycare & Creches",
    slug: "daycare-creches",
    displayOrder: 22,
  },
  {
    name: "Electricians / Plumbers",
    slug: "electricians-plumbers",
    displayOrder: 23,
  },
  {
    name: "Carpenters / Painters",
    slug: "carpenters-painters",
    displayOrder: 24,
  },
  {
    name: "AC / Refrigerator / Appliance Technicians",
    slug: "ac-refrigerator-appliance-technicians",
    displayOrder: 25,
  },
  {
    name: "House Cleaning & Pest Control",
    slug: "house-cleaning-pest-control",
    displayOrder: 26,
  },
  {
    name: "Laundry / Dry Cleaning Services",
    slug: "laundry-dry-cleaning-services",
    displayOrder: 27,
  },
  {
    name: "Gas Agencies / Water Supply Services",
    slug: "gas-agencies-water-supply-services",
    displayOrder: 28,
  },
  {
    name: "Courier / Parcel Services",
    slug: "courier-parcel-services",
    displayOrder: 29,
  },
  {
    name: "Event Planners / Decorators",
    slug: "event-planners-decorators",
    displayOrder: 30,
  },
  {
    name: "Wedding / Photography Studios",
    slug: "wedding-photography-studios",
    displayOrder: 31,
  },
  {
    name: "DJs / Sound & Light Providers",
    slug: "djs-sound-light-providers",
    displayOrder: 32,
  },
  {
    name: "Banquet Halls / Community Centers",
    slug: "banquet-halls-community-centers",
    displayOrder: 33,
  },
  {
    name: "Florists / Balloon Decorators",
    slug: "florists-balloon-decorators",
    displayOrder: 34,
  },
  {
    name: "Handicraft & Cottage Industry Producers",
    slug: "handicraft-cottage-industry-producers",
    displayOrder: 35,
  },
  {
    name: "Dairy & Poultry Farms",
    slug: "dairy-poultry-farms",
    displayOrder: 36,
  },
  {
    name: "NGOs / Charitable Trusts",
    slug: "ngos-charitable-trusts",
    displayOrder: 37,
  },
  {
    name: "Local News / Media Outlets",
    slug: "local-news-media-outlets",
    displayOrder: 38,
  },
  {
    name: "Photography / Videography Services",
    slug: "photography-videography-services",
    displayOrder: 39,
  },
  {
    name: "Pet Care / Veterinary Shops",
    slug: "pet-care-veterinary-shops",
    displayOrder: 40,
  },
];

const seedCategories = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");

    for (const category of categories) {
      const existingCategory = await Category.findOne({
        slug: category.slug,
      });

      if (existingCategory) {
        existingCategory.name = category.name;
        existingCategory.displayOrder = category.displayOrder;
        existingCategory.isActive = true;

        await existingCategory.save();

        console.log(`Updated: ${category.name}`);
      } else {
        await Category.create({
          ...category,
          description: "",
          icon: "",
          image: "",
          isActive: true,
        });

        console.log(`Created: ${category.name}`);
      }
    }

    console.log("\n=================================");
    console.log("Category seeding completed.");
    console.log(`Total categories: ${categories.length}`);
    console.log("=================================\n");
  } catch (error) {
    console.error("Category seeding failed:");
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

seedCategories();
