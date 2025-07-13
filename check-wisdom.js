
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWisdom() {
  try {
    console.log('Checking Stoic Wisdom entries...');
    const wisdomEntries = await prisma.stoicWisdom.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        author: true
      }
    });
    
    console.log('Total wisdom entries:', wisdomEntries.length);
    
    if (wisdomEntries.length === 0) {
      console.log('No wisdom entries found in database!');
    } else {
      console.log('\nWisdom entries by category:');
      const categories = {};
      wisdomEntries.forEach(entry => {
        if (!categories[entry.category]) {
          categories[entry.category] = [];
        }
        categories[entry.category].push(entry);
      });
      
      Object.keys(categories).forEach(category => {
        console.log('\nCategory:', category);
        categories[category].forEach(entry => {
          console.log('  -', entry.title, 'by', entry.author);
        });
      });
      
      console.log('\nAvailable categories:', Object.keys(categories));
      
      const hasPhilosophicalDialogues = Object.keys(categories).includes('Philosophical Dialogues');
      console.log('Has Philosophical Dialogues category:', hasPhilosophicalDialogues);
    }
  } catch (error) {
    console.error('Error checking wisdom:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWisdom();
