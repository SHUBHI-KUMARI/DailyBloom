import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Helper function to get date string in YYYY-MM-DD format
const getDateString = (daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
};

// Helper function to get Date object for a specific time ago
const getDate = (daysAgo = 0, hoursAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date;
};

async function main() {
  console.log("🌸 Starting DailyBloom seed...\n");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.habitProgress.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.moodEntry.deleteMany();
  await prisma.journal.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Cleared!\n");

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash("Demo@123", 10);

  // Create all users first
  console.log("👤 Creating users...");
  const [sarah, alex, maya] = await Promise.all([
    prisma.user.create({
      data: {
        email: "sarah@demo.com",
        password: hashedPassword,
        name: "Sarah Johnson",
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "alex@demo.com",
        password: hashedPassword,
        name: "Alex Chen",
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "maya@demo.com",
        password: hashedPassword,
        name: "Maya Patel",
        emailVerified: true,
      },
    }),
  ]);
  console.log("✅ Users created!\n");

  // ============================================
  // CREATE ALL HABITS
  // ============================================
  console.log("✅ Creating habits...");
  
  // Sarah's habits
  const sarahHabit1 = await prisma.habit.create({ data: { name: "Morning Meditation", userId: sarah.id } });
  const sarahHabit2 = await prisma.habit.create({ data: { name: "Read 30 minutes", userId: sarah.id } });
  const sarahHabit3 = await prisma.habit.create({ data: { name: "Exercise", userId: sarah.id } });
  const sarahHabit4 = await prisma.habit.create({ data: { name: "Drink 8 glasses of water", userId: sarah.id } });
  const sarahHabit5 = await prisma.habit.create({ data: { name: "Journal before bed", userId: sarah.id } });

  // Alex's habits
  const alexHabit1 = await prisma.habit.create({ data: { name: "Wake up by 7am", userId: alex.id } });
  const alexHabit2 = await prisma.habit.create({ data: { name: "No social media before noon", userId: alex.id } });
  const alexHabit3 = await prisma.habit.create({ data: { name: "Complete one task before email", userId: alex.id } });
  const alexHabit4 = await prisma.habit.create({ data: { name: "10-minute workout", userId: alex.id } });

  // Maya's habits
  const mayaHabit1 = await prisma.habit.create({ data: { name: "Creative writing (15 min)", userId: maya.id } });
  const mayaHabit2 = await prisma.habit.create({ data: { name: "Sketch something", userId: maya.id } });
  const mayaHabit3 = await prisma.habit.create({ data: { name: "Practice guitar", userId: maya.id } });
  const mayaHabit4 = await prisma.habit.create({ data: { name: "Take a photo", userId: maya.id } });
  const mayaHabit5 = await prisma.habit.create({ data: { name: "No screens after 9pm", userId: maya.id } });
  const mayaHabit6 = await prisma.habit.create({ data: { name: "Herbal tea before bed", userId: maya.id } });

  console.log("✅ Habits created!\n");

  // ============================================
  // CREATE HABIT PROGRESS (batched)
  // ============================================
  console.log("📊 Creating habit progress...");
  
  const progressData = [];

  // Sarah's progress - 90% completion rate
  const sarahHabits = [sarahHabit1, sarahHabit2, sarahHabit3, sarahHabit4, sarahHabit5];
  for (const habit of sarahHabits) {
    for (let day = 0; day < 30; day++) {
      if (Math.random() > 0.1) {
        progressData.push({ habitId: habit.id, date: getDateString(day), completed: true });
      }
    }
  }

  // Alex's progress - Improving over time (40% -> 75%)
  const alexHabits = [alexHabit1, alexHabit2, alexHabit3, alexHabit4];
  for (const habit of alexHabits) {
    for (let day = 0; day < 21; day++) {
      const completionChance = day < 7 ? 0.75 : day < 14 ? 0.55 : 0.4;
      if (Math.random() < completionChance) {
        progressData.push({ habitId: habit.id, date: getDateString(day), completed: true });
      }
    }
  }

  // Maya's progress - 70% with creative bursts
  const mayaHabits = [mayaHabit1, mayaHabit2, mayaHabit3, mayaHabit4, mayaHabit5, mayaHabit6];
  for (const habit of mayaHabits) {
    for (let day = 0; day < 25; day++) {
      const isBurstDay = day % 3 === 0;
      const completionChance = isBurstDay ? 0.9 : 0.6;
      if (Math.random() < completionChance) {
        progressData.push({ habitId: habit.id, date: getDateString(day), completed: true });
      }
    }
  }

  await prisma.habitProgress.createMany({ data: progressData });
  console.log(`✅ ${progressData.length} habit progress entries created!\n`);

  // ============================================
  // CREATE JOURNALS (batched)
  // ============================================
  console.log("📓 Creating journal entries...");

  await prisma.journal.createMany({
    data: [
      // Sarah's journals
      { title: "A productive start to the week", content: `<p>Today was amazing! I woke up early and completed my morning meditation. The sunrise was beautiful.</p><p>Work went smoothly - I finished the project proposal ahead of schedule. My manager complimented my work!</p><p>In the evening, I went for a long walk in the park. The autumn leaves are so beautiful. I'm grateful for these simple moments.</p>`, date: getDate(0, 2), userId: sarah.id },
      { title: "Reflections on personal growth", content: `<p>Been thinking about how far I've come this year. Six months ago, I couldn't meditate for 5 minutes. Now I do 20 minutes every morning.</p><p>It's the small, consistent actions that lead to big changes.</p><p><strong>Goals for next month:</strong></p><ul><li>Start learning Spanish</li><li>Try a new recipe every week</li></ul>`, date: getDate(2, 5), userId: sarah.id },
      { title: "Weekend adventures", content: `<p>Spent the weekend hiking with friends. The view from the top was breathtaking!</p><p>Sometimes we get so caught up in daily routines that we forget to experience life fully. This trip reminded me to make time for adventure.</p>`, date: getDate(5, 8), userId: sarah.id },
      { title: "Gratitude and mindfulness", content: `<p>Today I'm practicing gratitude. Things I'm thankful for:</p><ol><li>My health and energy</li><li>Supportive family and friends</li><li>A job that challenges me</li><li>This cozy apartment</li></ol>`, date: getDate(7, 3), userId: sarah.id },
      { title: "Dealing with challenges", content: `<p>Had a tough day at work. A project I worked hard on got delayed due to circumstances beyond my control.</p><p>But I remembered: setbacks are part of growth. I can't control everything, but I can control my response. Tomorrow is a new day.</p>`, date: getDate(10, 6), userId: sarah.id },

      // Alex's journals
      { title: "Day 1: Starting fresh (again)", content: `<p>Okay, this is it. I've tried to build better habits before and failed. But this time feels different.</p><p>My biggest struggle is procrastination. I waste hours on social media and then feel guilty. It's a vicious cycle.</p><p>Small steps. Just small steps.</p>`, date: getDate(20, 10), userId: alex.id },
      { title: "Week 1 reflections", content: `<p>One week in! I'm not perfect, but I'm trying. Managed to wake up on time 4 out of 7 days. That's progress, right?</p><p>The hardest habit is "no social media before noon." I keep reaching for my phone automatically. I've started putting it in another room.</p>`, date: getDate(13, 4), userId: alex.id },
      { title: "The struggle is real", content: `<p>Fell off the wagon a bit this week. Work got stressful and I reverted to old habits. Stayed up late scrolling, woke up tired...</p><p>But I'm not giving up. Every expert was once a beginner. Tomorrow I start again.</p>`, date: getDate(8, 2), userId: alex.id },
      { title: "Small wins matter", content: `<p>Today I completed my morning task BEFORE checking email for the first time in ages. It felt so good!</p><p>When you start the day with a win, it sets the tone for everything else. I'm starting to understand why successful people swear by morning routines.</p>`, date: getDate(3, 7), userId: alex.id },

      // Maya's journals
      { title: "Inspiration struck ✨", content: `<p>I was walking through the old part of town when I saw the most beautiful mural - a massive butterfly made of broken mosaic tiles.</p><p>It got me thinking about how beauty often emerges from brokenness. I immediately sketched it in my notebook.</p>`, date: getDate(1, 3), userId: maya.id },
      { title: "Guitar progress and frustrations", content: `<p>Been practicing guitar for 3 months now. Some days I feel like I'm getting somewhere; other days my fingers feel clumsy.</p><p>Today I finally nailed that chord transition I've been struggling with! 🎸 The secret was slowing down - way down.</p>`, date: getDate(4, 6), userId: maya.id },
      { title: "The art of slowing down", content: `<p>I've been so focused on creating that I forgot to just... be. Today I spent an hour watching clouds. No phone, no music, just me and the sky.</p><p>Creativity needs space. You can't pour from an empty cup.</p>`, date: getDate(8, 2), userId: maya.id },
      { title: "New project idea!", content: `<p>I have an idea for a mixed-media project: combining my photography, sketches, and writing into a "365 Days of Noticing" book.</p><p><strong>Rules:</strong></p><ul><li>No perfection, just practice</li><li>Share at least once a week</li><li>Include mistakes</li></ul>`, date: getDate(12, 5), userId: maya.id },
      { title: "On creative block", content: `<p>Haven't created anything in 5 days. The blank page feels like an enemy. Every idea feels stupid before I even try.</p><p>But I know this is part of the process. Creative block isn't the absence of creativity - it's creativity taking a breath.</p>`, date: getDate(15, 8), userId: maya.id },
      { title: "Colors of autumn", content: `<p>Autumn is my favorite season for photography. Today's color palette:</p><ul><li>Burnt orange leaves against grey sky</li><li>Deep burgundy dahlias</li><li>Golden light at 5pm</li><li>Brown coffee in a cream-colored mug</li></ul>`, date: getDate(18, 4), userId: maya.id },
    ],
  });
  console.log("✅ 15 journal entries created!\n");

  // ============================================
  // CREATE MOOD ENTRIES (batched)
  // ============================================
  console.log("😊 Creating mood entries...");

  await prisma.moodEntry.createMany({
    data: [
      // Sarah's moods - Generally positive
      { mood: "great", note: "Amazing morning meditation session!", date: getDate(0, 2), userId: sarah.id },
      { mood: "good", note: "Productive day at work", date: getDate(1, 4), userId: sarah.id },
      { mood: "great", note: "Got a promotion at work! 🎉", date: getDate(2, 3), userId: sarah.id },
      { mood: "good", note: null, date: getDate(3, 5), userId: sarah.id },
      { mood: "neutral", note: "Just an ordinary day", date: getDate(4, 6), userId: sarah.id },
      { mood: "good", note: "Nice dinner with friends", date: getDate(5, 2), userId: sarah.id },
      { mood: "great", note: "Weekend hiking adventure!", date: getDate(6, 8), userId: sarah.id },
      { mood: "good", note: "Relaxing Sunday", date: getDate(7, 3), userId: sarah.id },
      { mood: "neutral", note: "Monday blues", date: getDate(8, 4), userId: sarah.id },
      { mood: "good", note: "Made progress on my goals", date: getDate(9, 5), userId: sarah.id },
      { mood: "bad", note: "Project got delayed, feeling frustrated", date: getDate(10, 2), userId: sarah.id },
      { mood: "neutral", note: "Recovering from disappointment", date: getDate(11, 6), userId: sarah.id },
      { mood: "good", note: "Fresh perspective on things", date: getDate(12, 3), userId: sarah.id },
      { mood: "great", note: "Everything clicked today!", date: getDate(13, 4), userId: sarah.id },

      // Alex's moods - Variable with improvement
      { mood: "good", note: "Actually woke up on time!", date: getDate(0, 3), userId: alex.id },
      { mood: "neutral", note: "Okay day, could be better", date: getDate(1, 5), userId: alex.id },
      { mood: "good", note: "Completed my workout streak", date: getDate(2, 4), userId: alex.id },
      { mood: "neutral", note: null, date: getDate(3, 6), userId: alex.id },
      { mood: "bad", note: "Procrastinated on important task", date: getDate(4, 2), userId: alex.id },
      { mood: "neutral", note: "Getting back on track", date: getDate(5, 3), userId: alex.id },
      { mood: "good", note: "Productive afternoon!", date: getDate(6, 5), userId: alex.id },
      { mood: "awful", note: "Stayed up too late, ruined my morning", date: getDate(7, 4), userId: alex.id },
      { mood: "bad", note: "Struggling to focus", date: getDate(8, 6), userId: alex.id },
      { mood: "neutral", note: "Mediocre but surviving", date: getDate(9, 2), userId: alex.id },
      { mood: "good", note: "Finally got stuff done", date: getDate(10, 3), userId: alex.id },
      { mood: "neutral", note: null, date: getDate(11, 5), userId: alex.id },
      { mood: "bad", note: "Work stress getting to me", date: getDate(12, 4), userId: alex.id },
      { mood: "neutral", note: "Day 1 of new habits", date: getDate(13, 6), userId: alex.id },

      // Maya's moods - Creative and expressive
      { mood: "great", note: "Creative flow state all day!", date: getDate(0, 2), userId: maya.id },
      { mood: "great", note: "Finished my sketch series", date: getDate(1, 3), userId: maya.id },
      { mood: "good", note: "Peaceful morning with tea and writing", date: getDate(2, 5), userId: maya.id },
      { mood: "neutral", note: "Quiet day, recharging", date: getDate(3, 4), userId: maya.id },
      { mood: "good", note: "Guitar practice went well!", date: getDate(4, 6), userId: maya.id },
      { mood: "neutral", note: null, date: getDate(5, 2), userId: maya.id },
      { mood: "bad", note: "Creative block hitting hard", date: getDate(6, 3), userId: maya.id },
      { mood: "neutral", note: "Pushing through the block", date: getDate(7, 5), userId: maya.id },
      { mood: "good", note: "The walk helped, got new ideas", date: getDate(8, 4), userId: maya.id },
      { mood: "great", note: "Inspiration overload!", date: getDate(9, 6), userId: maya.id },
      { mood: "good", note: "Productive creative session", date: getDate(10, 2), userId: maya.id },
      { mood: "good", note: null, date: getDate(11, 3), userId: maya.id },
      { mood: "neutral", note: "Need more rest", date: getDate(12, 5), userId: maya.id },
      { mood: "good", note: "New project excitement!", date: getDate(13, 4), userId: maya.id },
    ],
  });
  console.log("✅ 42 mood entries created!\n");

  // ============================================
  // Summary
  // ============================================
  console.log("=".repeat(50));
  console.log("🌸 SEED COMPLETE! 🌸");
  console.log("=".repeat(50));
  console.log("\n📊 Summary:");
  console.log("   👤 3 Users created");
  console.log("   ✅ 15 Habits with progress data");
  console.log("   📓 15 Journal entries");
  console.log("   😊 42 Mood entries");
  console.log("\n🔐 Login Credentials (same for all):");
  console.log("   Password: Demo@123");
  console.log("\n📧 Demo Accounts:");
  console.log("   1. sarah@demo.com - Consistent Achiever");
  console.log("   2. alex@demo.com  - Recovering Procrastinator");
  console.log("   3. maya@demo.com  - Creative Explorer");
  console.log("\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
