import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import './AchievementCard.scss';

export default function AchievementCard({ cardInfo, isDark }) {
  const [isHovered, setIsHovered] = useState(false);

  function openUrlInNewTab(url, name) {
    if (!url) {
      console.log(`URL for ${name} not found`);
      return;
    }
    window.open(url, "_blank")?.focus();
  }

  return (
    <motion.div 
      className={`achievement-card ${isDark ? 'dark-mode' : ''}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut" 
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div 
        className="card-image-container"
        initial={{ borderRadius: '10px' }}
        animate={{ 
          borderRadius: isHovered ? '20px' : '10px',
          transition: { duration: 0.3 }
        }}
      >
        <img
          src={cardInfo.image}
          alt={cardInfo.imageAlt || "Card Thumbnail"}
          className="card-image"
        />
        {isHovered && (
          <motion.div 
            className="image-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.div>

      <div className="certificate-detail-div">
        <motion.h5 
          className={`card-title ${isDark ? 'dark-mode' : ''}`}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {cardInfo.title}
        </motion.h5>
        <motion.p 
          className={`card-subtitle ${isDark ? 'dark-mode' : ''}`}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {cardInfo.description}
        </motion.p>
      </div>

      <div className="certificate-card-footer">
        {cardInfo.footer.map((v, i) => (
          <motion.span
            key={i}
            className={`certificate-tag ${isDark ? 'dark-mode' : ''}`}
            onClick={() => openUrlInNewTab(v.url, v.name)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {v.name}
            <ExternalLink 
              size={14} 
              className="external-link-icon" 
            />
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}