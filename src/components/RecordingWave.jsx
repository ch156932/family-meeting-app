import { motion } from 'framer-motion';

export default function RecordingWave({ isRecording }) {
  const bars = Array.from({ length: 5 });

  return (
    <div className="flex items-center justify-center gap-1 h-10">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className={`w-1.5 rounded-full ${isRecording ? 'bg-red-400' : 'bg-gray-300'}`}
          animate={isRecording ? {
            height: ['8px', `${16 + Math.random() * 24}px`, '8px'],
          } : { height: '8px' }}
          transition={isRecording ? {
            duration: 0.5 + i * 0.1,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: i * 0.1,
          } : {}}
        />
      ))}
    </div>
  );
}
