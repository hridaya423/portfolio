/* Change this file to get your personal Portfolio */

// To change portfolio colors globally go to the  _globalColor.scss file

import emoji from "react-easy-emoji";
import splashAnimation from "./assets/lottie/splashAnimation"; // Rename to your file name for custom animation

// Splash Screen

const splashScreen = {
  enabled: true, // set false to disable splash screen
  animation: splashAnimation,
  duration: 2000 // Set animation duration as per your animation
};

// Summary And Greeting Section

const illustration = {
  animated: true // Set to false to use static SVG
};

const greeting = {
  username: "Hridya Agrawal",
  title: "Hello, I'm Hridya",
  subTitle: emoji(
    "A skilled Full Stack Developer proficient in JavaScript, React.js, Python, and Flutter. Passionate about creating innovative web and mobile applications that deliver exceptional user experiences through cutting-edge technologies."
  ),
  resumeLink:
    "", // Set to empty to hide the button
  displayGreeting: true // Set false to hide this section, defaults to true
};

// Social Media Links

const socialMediaLinks = {
  github: "https://github.com/hridaya423",
  gmail: "hridayahoney@gmail.com",
  stackoverflow: "https://stackoverflow.com/users/15129164/hridaya-agrawal",
  twitter: "https://x.com/AgrawalHridaya",
  instagram: "https://www.instagram.com/hridayaagrawal2/",
  display: true // Set true to display this section, defaults to false
};

// Skills Section

const skillsSection = {
  title: "What I Do",
  subTitle: "Passionate Full Stack Developer Exploring Diverse Tech Stacks",
  skills: [
    emoji(
      "⚡ Create highly interactive front-end/user interfaces for web and mobile applications"
    ),
    emoji(
      "⚡ Integrate third-party services such as Firebase, AWS, Digital Ocean, OpenAI, Azure, Supabase, and Google Cloud"
    ),
    emoji("⚡ Develop robust backend architectures using Node.js, Express.js, and various RESTful and GraphQL APIs"),
    emoji("⚡ Implement efficient database solutions with SQL and NoSQL databases, including MySQL, PostgreSQL, and MongoDB"),
    emoji("⚡ Utilize version control systems like Git for streamlined and collaborative development"),
    emoji("⚡ Ensure cross-platform optimization for seamless performance on different devices and browsers"),
    emoji("⚡ Deploy and manage applications on cloud platforms, ensuring scalability and high availability"),
    emoji("⚡ Follow agile methodologies for efficient project management and continuous delivery"),
    emoji("⚡ Enhance user experience with responsive design and intuitive UI/UX principles")
  ],


  softwareSkills: [
    {
      skillName: "HTML-5",
      fontAwesomeClassname: "fab fa-html5",
      color: "#E34F26"
    },
    {
      skillName: "CSS3",
      fontAwesomeClassname: "fab fa-css3-alt",
      color: "#1572B6"
    },
    {
      skillName: "Sass",
      fontAwesomeClassname: "fab fa-sass",
      color: "#CC6699"
    },
    {
      skillName: "JavaScript",
      fontAwesomeClassname: "fab fa-js",
      color: "#F7DF1E"
    },
    {
      skillName: "Reactjs",
      fontAwesomeClassname: "fab fa-react",
      color: "#61DAFB"
    },
    {
      skillName: "Nodejs",
      fontAwesomeClassname: "fab fa-node",
      color: "#339933"
    },
    {
      skillName: "npm",
      fontAwesomeClassname: "fab fa-npm",
      color: "#CB3837"
    },
    {
      skillName: "Sql-database",
      fontAwesomeClassname: "fas fa-database",
      color: "#336791"
    },
    {
      skillName: "AWS",
      fontAwesomeClassname: "fab fa-aws",
      color: "#FF9900"
    },
    {
      skillName: "Firebase",
      fontAwesomeClassname: "fas fa-fire",
      color: "#FFCA28"
    },
    {
      skillName: "Python",
      fontAwesomeClassname: "fab fa-python",
      color: "#3776AB"
    },
    {
      skillName: "Docker",
      fontAwesomeClassname: "fab fa-docker",
      color: "#2496ED"
    },
    {
      skillName: "Linux",
      fontAwesomeClassname: "fab fa-linux",
      color: "#000000"
    },
    {
      skillName: "Git",
      fontAwesomeClassname: "fab fa-git-alt",
      color: "#F05032"
    },
  ],
  display: true // Set false to hide this section, defaults to true
};

// Education Section

const educationInfo = {
  display: false, // Set false to hide this section, defaults to true
  schools: [
    {
      schoolName: "Harvard University",
      logo: require("./assets/images/harvardLogo.png"),
      subHeader: "Master of Science in Computer Science",
      duration: "September 2017 - April 2019",
      desc: "Participated in the research of XXX and published 3 papers.",
      descBullets: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
      ]
    },
  ]
};

// Your top 3 proficient stacks/tech experience

const techStack = {
  viewSkillBars: true, //Set it to true to show Proficiency Section
  experience: [
    {
      Stack: "Frontend/Design", //Insert stack or technology you have experience in
      progressPercentage: "85%" //Insert relative proficiency in percentage
    },
    {
      Stack: "Backend",
      progressPercentage: "60%"
    },
    {
      Stack: "Programming",
      progressPercentage: "90%"
    }
  ],
  displayCodersrank: false // Set true to display codersrank badges section need to changes your username in src/containers/skillProgress/skillProgress.js:17:62, defaults to false
};

// Work experience section

const workExperiences = {
  display: false, //Set it to true to show workExperiences Section
  experience: [
   
  ]
};

/* Your Open Source Section to View Your Github Pinned Projects
To know how to get github key look at readme.md */

const openSource = {
  showGithubProfile: "true", // Set true or false to show Contact profile using Github, defaults to true
  display: true // Set false to hide this section, defaults to true
};

// Some big projects you have worked on

const bigProjects = {
  title: "Big Projects",
  subtitle: "SOME STARTUPS AND COMPANIES THAT I HELPED TO CREATE THEIR TECH",
  projects: [

  ],
  display: false // Set false to hide this section, defaults to true
};

// Achievement Section
// Include certificates, talks etc

const achievementSection = {
  title: emoji("Achievements And Certifications "),
  subtitle:
    "Achievements, Certifications, Award Letters and Some Cool Stuff that I have done !",

  achievementsCards: [
    {
      title: "AZ-900",
      subtitle:
        "Achieved AZ-900 Microsoft certification at age 11",
      image: require("./assets/images/az-900.png"),
      imageAlt: "Cert Logo",
      footerLink: [
        {
          name: "Certification",
          url: "https://www.credly.com/badges/c2d19134-47d4-4ded-a7cf-12e6455c29ff"
        },
      ]
    },
     {
      title: "DP-900",
      subtitle:
        "Achieved DP-900 Microsoft certification at age 11",
      image: require("./assets/images/dp-900.png"),
      imageAlt: "Cert Logo",
      footerLink: [
        {
          name: "Certification",
          url: "https://www.credly.com/badges/512c8f33-bace-4676-af29-2e7c0a027911"
        },
      ]
    },
     {
      title: "AI-900",
      subtitle:
        "Achieved AI-900 Microsoft certification at age 11",
      image: require("./assets/images/ai-900.png"),
      imageAlt: "Cert Logo",
      footerLink: [
        {
          name: "Certification",
          url: "https://www.credly.com/badges/008c2b1f-53e5-4548-9ceb-b1e7aac41d81"
        },
      ]
    },
     {
      title: "SC-900",
      subtitle:
        "Achieved SC-900 Microsoft certification at age 11",
      image: require("./assets/images/sc-900.png"),
      imageAlt: "Cert Logo",
      footerLink: [
        {
          name: "Certification",
          url: "https://www.credly.com/badges/42bb3fbe-91c7-4af9-af34-15e2d8d3662f"
        },
      ]
    },
     {
      title: "PL-900",
      subtitle:
        "Achieved PL-900 Microsoft certification at age 11",
      image: require("./assets/images/pl-900.png"),
      imageAlt: "Cert Logo",
      footerLink: [
        {
          name: "Certification",
          url: "https://www.credly.com/badges/c1b54442-8027-4bf2-97d5-38b793281b9e"
        },
      ]
    },
     {
      title: "PL-100",
      subtitle:
        "Achieved PL-100 Microsoft certification at age 11",
      image: require("./assets/images/pl-100.png"),
      imageAlt: "Cert Logo",
      footerLink: [
        {
          name: "Certification",
          url: "https://www.credly.com/badges/b5c3ad33-0cb4-4496-9719-472ed6433d8c"
        },
      ]
    },
    {
      title: "Pega Certified System Architect",
      subtitle:
        "Achieved Pega CSA certification at age 11",
      image: require("./assets/images/pega.png"),
      imageAlt: "Pega",
      footerLink: [
        {
          name: "Shoutout",
          url: "https://www.linkedin.com/feed/update/urn:li:activity:6998310978840862720/"
        }
      ]
    },

    {
      title: "Oracle Gen AI",
      subtitle: "Achieved Oracle Gen AI certification at age 13",
      image: require("./assets/images/e.png"),
      imageAlt: "Certification",
      footerLink: [
        {
          name: "Badge",
          url: "https://t.co/OumPKteDbd"
        }
      ]
    },
    {
      title: "Github Foundations",
      subtitle:
        "Achieved Github Foundations certification at age 13",
      image: require("./assets/images/g-found.png"),
      imageAlt: "Cert Logo",
      footerLink: [
        {
          name: "Certification",
          url: "https://www.credly.com/badges/19280ad5-3220-4505-b5c9-12044ccfed0e/public_url"
        },
      ]
    },
  ],
  display: true // Set false to hide this section, defaults to true
};

// Blogs Section

const blogSection = {
  title: "Blogs",
  subtitle:
    "With Love for Developing cool stuff, I love to write and teach others what I have learnt.",
  displayMediumBlogs: "true", // Set true to display fetched medium blogs instead of hardcoded ones
  blogs: [
  ],
  display: false // Set false to hide this section, defaults to true
};

// Talks Sections

const talkSection = {
  title: "TALKS",
  subtitle: emoji(
    "I LOVE TO SHARE MY LIMITED KNOWLEDGE AND GET A SPEAKER BADGE 😅"
  ),

  talks: [
  ],
  display: false // Set false to hide this section, defaults to true
};

// Podcast Section

const podcastSection = {
  title: emoji("Podcast 🎙️"),
  subtitle: "I LOVE TO TALK ABOUT MYSELF AND TECHNOLOGY",

  // Please Provide with Your Podcast embeded Link
  podcast: [
   
  ],
  display: false // Set false to hide this section, defaults to true
};

// Resume Section
const resumeSection = {
  title: "Resume",
  subtitle: "Feel free to download my resume",

  // Please Provide with Your Podcast embeded Link
  display: false // Set false to hide this section, defaults to true
};

const contactInfo = {
  title: emoji("Contact Me ☎️"),
  subtitle:
    "Discuss a project or just want to say hi? My Inbox is open for all.",
  number: "",
  email_address: "hridayahoney@gmail.com"
};

// Twitter Section

const twitterDetails = {
  userName: "AgrawalHridaya", //Replace "twitter" with your twitter username without @
  display: false // Set true to display this section, defaults to false
};

const isHireable = true; // Set false if you are not looking for a job. Also isHireable will be display as Open for opportunities: Yes/No in the GitHub footer

export {
  illustration,
  greeting,
  socialMediaLinks,
  splashScreen,
  skillsSection,
  educationInfo,
  techStack,
  workExperiences,
  openSource,
  bigProjects,
  achievementSection,
  blogSection,
  talkSection,
  podcastSection,
  contactInfo,
  twitterDetails,
  isHireable,
  resumeSection
};

