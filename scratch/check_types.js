const mongoose = require('mongoose');
require('dotenv').config();
const Work = require('../models/Work');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const types = await Work.distinct('type');
  const count = await Work.countDocuments({});
  const all = await Work.find({}).lean();
  console.log('Distinct types:', types);
  console.log('Total count:', count);
  console.log('Counts by type:');
  types.forEach(t => {
    const c = all.filter(w => w.type === t).length;
    console.log(`- ${t}: ${c}`);
  });
  const untyped = all.filter(w => !w.type).length;
  console.log(`- (untyped): ${untyped}`);
  process.exit(0);
}
check();
