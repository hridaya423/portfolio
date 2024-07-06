import React, { Suspense, useContext, useEffect } from "react";
import "./twitter.scss";
import Loading from "../loading/Loading";
import { TwitterTimelineEmbed } from "react-twitter-embed";
import { twitterDetails } from "../../portfolio";
import StyleContext from "../../contexts/StyleContext";

const renderLoader = () => <Loading />;
const cantDisplayError = `
  <div class='centerContent error'>
    <h2>Can't load? Check privacy protection settings</h2>
  </div>`;

function Twitter() {
  const { isDark } = useContext(StyleContext);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (document.getElementById("twitter") && !document.getElementById("twitter").innerHTML.includes("iframe")) {
        document.getElementById("twitter").innerHTML = cantDisplayError;
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  if (!twitterDetails.display) {
    return null;
  }
  if (!twitterDetails.userName) {
    console.error("Twitter username for twitter section is missing");
    return null;
  }

  return (
    <Suspense fallback={renderLoader()}>
      <div className={`tw-main-div ${isDark ? "dark-mode" : "light-mode"}`} id="twitter">
        <div className="centerContent">
          <TwitterTimelineEmbed
            sourceType="profile"
            screenName={twitterDetails.userName}
            options={{ height: 400, width: window.screen.width }}
            placeholder={renderLoader()}
            autoHeight={false}
            borderColor="#fff"
            key={isDark ? "1" : "2"}
            theme={isDark ? "dark" : "light"}
            noFooter={true}
          />
        </div>
      </div>
    </Suspense>
  );
}

export default Twitter;
