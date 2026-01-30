import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions, Alert, NativeModules, Switch,
  Platform, Animated, Pressable, Vibration, StatusBar, Modal, TouchableOpacity,
  TextInput, PanResponder, Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { WallpaperModule } = NativeModules;
const { width: SW, height: SH } = Dimensions.get('window');

// ===================== ONBOARDING COMPONENT =====================
const ONBOARDING_KEY = '@yeardots_onboarding_complete';

const OnboardingScreen = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const dotScaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const pages = [
    {
      title: 'Visualize Your Year',
      subtitle: 'Every dot represents a day',
      description: 'Watch your year unfold with beautiful dot visualization. Past days light up, showing your journey through time.',
      color: '#4ADE80',
      icon: 'dots',
    },
    {
      title: 'Make It Yours',
      subtitle: 'Personalize everything',
      description: 'Choose colors, layouts, fonts, and styles. Create a wallpaper that matches your vibe perfectly.',
      color: '#60A5FA',
      icon: 'customize',
    },
    {
      title: 'Live Wallpaper',
      subtitle: 'Updates automatically',
      description: 'Set as your wallpaper and watch it update daily. Never lose track of your year again.',
      color: '#F472B6',
      icon: 'wallpaper',
    },
  ];

  useEffect(() => {
    animateIn();
  }, [currentPage]);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    dotScaleAnim.setValue(0);
    progressAnim.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(dotScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();

    // Pulse animation for the icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  };

  const handleNext = () => {
    Vibration.vibrate(10);
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    Vibration.vibrate(30);
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (e) {
      console.log('Error saving onboarding status', e);
    }
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => onComplete());
  };

  const handleSkip = () => {
    Vibration.vibrate(10);
    handleComplete();
  };

  const renderDotsIcon = (color) => {
    const rows = 5;
    const cols = 7;
    const dotSize = 8;
    const gap = 6;
    const filledDots = 17; // roughly 50% filled

    return (
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <View style={[onboardingStyles.iconContainer, { backgroundColor: color + '15' }]}>
          <View style={{ alignItems: 'center' }}>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <View key={rowIdx} style={{ flexDirection: 'row', marginBottom: rowIdx < rows - 1 ? gap : 0 }}>
                {Array.from({ length: cols }).map((_, colIdx) => {
                  const idx = rowIdx * cols + colIdx;
                  const isFilled = idx < filledDots;
                  return (
                    <Animated.View
                      key={colIdx}
                      style={{
                        width: dotSize,
                        height: dotSize,
                        borderRadius: dotSize / 2,
                        backgroundColor: isFilled ? (idx === filledDots - 1 ? color : '#fff') : '#333',
                        marginRight: colIdx < cols - 1 ? gap : 0,
                        transform: [{ scale: dotScaleAnim }],
                      }}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderCustomizeIcon = (color) => (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <View style={[onboardingStyles.iconContainer, { backgroundColor: color + '15' }]}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {['#4ADE80', '#60A5FA', '#F472B6', '#FBBF24'].map((c, i) => (
            <Animated.View
              key={i}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: c,
                transform: [{ scale: dotScaleAnim }],
                borderWidth: c === color ? 2 : 0,
                borderColor: '#fff',
              }}
            />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
          <Animated.View style={{ width: 40, height: 8, borderRadius: 4, backgroundColor: '#444', transform: [{ scale: dotScaleAnim }] }} />
          <Animated.View style={{ width: 40, height: 8, borderRadius: 4, backgroundColor: color, transform: [{ scale: dotScaleAnim }] }} />
          <Animated.View style={{ width: 40, height: 8, borderRadius: 4, backgroundColor: '#444', transform: [{ scale: dotScaleAnim }] }} />
        </View>
      </View>
    </Animated.View>
  );

  const renderWallpaperIcon = (color) => (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <View style={[onboardingStyles.iconContainer, { backgroundColor: color + '15' }]}>
        <View style={[onboardingStyles.phoneFrame, { borderColor: color + '50' }]}>
          <View style={{ alignItems: 'center', paddingTop: 15 }}>
            {/* Mini dots grid */}
            {Array.from({ length: 3 }).map((_, rowIdx) => (
              <View key={rowIdx} style={{ flexDirection: 'row', marginBottom: 3 }}>
                {Array.from({ length: 5 }).map((_, colIdx) => {
                  const idx = rowIdx * 5 + colIdx;
                  const isFilled = idx < 8;
                  return (
                    <Animated.View
                      key={colIdx}
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: isFilled ? (idx === 7 ? color : '#fff') : '#555',
                        marginRight: colIdx < 4 ? 3 : 0,
                        transform: [{ scale: dotScaleAnim }],
                      }}
                    />
                  );
                })}
              </View>
            ))}
          </View>
          {/* Home button indicator */}
          <View style={{ position: 'absolute', bottom: 6, left: '50%', marginLeft: -10, width: 20, height: 4, borderRadius: 2, backgroundColor: color + '80' }} />
        </View>
      </View>
    </Animated.View>
  );

  const renderIcon = (iconType, color) => {
    switch (iconType) {
      case 'dots': return renderDotsIcon(color);
      case 'customize': return renderCustomizeIcon(color);
      case 'wallpaper': return renderWallpaperIcon(color);
      default: return null;
    }
  };

  const page = pages[currentPage];

  return (
    <View style={onboardingStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />

      {/* Skip button */}
      {currentPage < pages.length - 1 && (
        <TouchableOpacity style={onboardingStyles.skipBtn} onPress={handleSkip}>
          <Text style={onboardingStyles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <Animated.View
        style={[
          onboardingStyles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Icon */}
        <View style={onboardingStyles.iconWrapper}>
          {renderIcon(page.icon, page.color)}
        </View>

        {/* Text */}
        <View style={onboardingStyles.textContainer}>
          <Text style={[onboardingStyles.subtitle, { color: page.color }]}>{page.subtitle}</Text>
          <Text style={onboardingStyles.title}>{page.title}</Text>
          <Text style={onboardingStyles.description}>{page.description}</Text>
        </View>
      </Animated.View>

      {/* Bottom section */}
      <View style={onboardingStyles.bottomSection}>
        {/* Page indicators */}
        <View style={onboardingStyles.indicators}>
          {pages.map((p, idx) => (
            <View
              key={idx}
              style={[
                onboardingStyles.indicator,
                {
                  backgroundColor: idx === currentPage ? p.color : '#333',
                  width: idx === currentPage ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Next/Get Started button */}
        <TouchableOpacity
          style={[onboardingStyles.nextBtn, { backgroundColor: page.color }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={onboardingStyles.nextText}>
            {currentPage === pages.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const onboardingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: StatusBar.currentHeight || 50,
  },
  skipBtn: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 50) + 10,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrapper: {
    marginBottom: 60,
  },
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneFrame: {
    width: 60,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: '#111',
    overflow: 'hidden',
  },
  textContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bottomSection: {
    paddingHorizontal: 32,
    paddingBottom: 50,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  nextText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
});

// ===================== MAIN APP =====================

// Premium Fonts
const FONTS = [
  { id: 'SF_THIN', label: 'Thin', weight: '100' },
  { id: 'SF_LIGHT', label: 'Light', weight: '300' },
  { id: 'SF_REGULAR', label: 'Regular', weight: '400' },
  { id: 'SF_MEDIUM', label: 'Medium', weight: '500' },
  { id: 'SF_BOLD', label: 'Bold', weight: '700' },
  { id: 'SERIF', label: 'Serif', family: 'serif' },
  { id: 'MONO', label: 'Mono', family: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
];

// Grid Layouts - no emojis
const GRID_LAYOUTS = [
  { id: 'STANDARD', label: 'Standard', cols: 17 },
  { id: 'COMPACT', label: 'Compact', cols: 21 },
  { id: 'LOOSE', label: 'Loose', cols: 13 },
  { id: 'CALENDAR', label: 'Calendar', cols: 7 },
  { id: 'WIDE', label: 'Wide', cols: 25 },
];

const TEXT_SIZES = [
  { id: 'XS', label: 'XS', value: 0.7 },
  { id: 'S', label: 'S', value: 0.85 },
  { id: 'M', label: 'M', value: 1.0 },
  { id: 'L', label: 'L', value: 1.2 },
  { id: 'XL', label: 'XL', value: 1.5 },
];

const OPACITIES = [
  { id: '25', label: '25%', value: 0.25 },
  { id: '50', label: '50%', value: 0.5 },
  { id: '75', label: '75%', value: 0.75 },
  { id: '100', label: '100%', value: 1.0 },
];

const COLORS = ['#4ADE80', '#22D3EE', '#60A5FA', '#A78BFA', '#F472B6', '#FB7185', '#FB923C', '#FBBF24', '#FFFFFF'];
const SHAPES = ['ROUNDED', 'CIRCLE', 'SQUARE'];
const SIZES = ['SMALL', 'MEDIUM', 'LARGE'];

const isLeapYear = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const getDayOfYear = () => Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);

export default function App() {
  // Onboarding states
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const mainAppOpacity = useRef(new Animated.Value(0)).current;

  // Main app states
  const [color, setColor] = useState('#4ADE80');
  const [shape, setShape] = useState('ROUNDED');
  const [size, setSize] = useState('MEDIUM');
  const [gridLayout, setGridLayout] = useState('STANDARD');
  const [font, setFont] = useState('SF_LIGHT');
  const [textSizeId, setTextSizeId] = useState('M');
  const [opacityId, setOpacityId] = useState('100');
  const [customText, setCustomText] = useState('');
  const [showStats, setShowStats] = useState(true);
  const [showYear, setShowYear] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });

  // Check onboarding status on mount
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (onboardingComplete === null) {
        // First time user - show onboarding
        setShowOnboarding(true);
      } else {
        // Returning user - set main app opacity to 1
        mainAppOpacity.setValue(1);
      }
    } catch (e) {
      console.log('Error checking onboarding status', e);
      mainAppOpacity.setValue(1);
    }
    // Fade out splash
    setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setIsLoading(false));
    }, 800);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    Animated.timing(mainAppOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const time = new Date();
  const totalDays = isLeapYear(time.getFullYear()) ? 366 : 365;
  const currentDay = getDayOfYear();
  const daysLeft = totalDays - currentDay;
  const percent = Math.round((currentDay / totalDays) * 100);

  const textSize = TEXT_SIZES.find(t => t.id === textSizeId)?.value || 1;
  const textOpacity = OPACITIES.find(o => o.id === opacityId)?.value || 1;
  const cols = GRID_LAYOUTS.find(g => g.id === gridLayout)?.cols || 17;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SH)).current;
  const lastOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { lastOffset.current = { ...gridOffset }; },
      onPanResponderMove: (_, gs) => {
        // Calculate new offsets with bounds checking
        // Limit horizontal movement to +/- 100 pixels
        // Limit vertical movement to +/- 150 pixels (accounts for preview padding difference)
        const newX = Math.max(-100, Math.min(100, lastOffset.current.x + gs.dx));
        const newY = Math.max(-150, Math.min(150, lastOffset.current.y + gs.dy));
        setGridOffset({ x: newX, y: newY });
      },
      onPanResponderRelease: () => { Vibration.vibrate(5); },
    })
  ).current;

  const openModal = () => {
    setModalOpen(true);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 9 }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, { toValue: SH, duration: 200, useNativeDriver: true }).start(() => setModalOpen(false));
  };

  const resetGrid = () => { setGridOffset({ x: 0, y: 0 }); Vibration.vibrate(10); };

  const handleSetWallpaper = useCallback(() => {
    if (!WallpaperModule) return Alert.alert("Error", "Module not found");
    Vibration.vibrate(30);
    try {
      WallpaperModule.saveSettings(
        color, shape, size, showStats, showStats, showYear, font,
        textSize, textOpacity, customText, 1.0, gridOffset.x, gridOffset.y, true, gridLayout
      );
      WallpaperModule.openWallpaperPicker();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }, [color, shape, size, showStats, showYear, font, textSize, textOpacity, customText, gridOffset, gridLayout]);

  const DotGrid = useMemo(() => {
    const dotSz = size === 'SMALL' ? 7 : size === 'LARGE' ? 13 : 9;
    const gap = size === 'LARGE' ? 4 : 3;
    const rows = [];
    for (let r = 0; r < Math.ceil(totalDays / cols); r++) {
      const rowDots = [];
      for (let c = 0; c < cols && r * cols + c < totalDays; c++) {
        const idx = r * cols + c;
        const isToday = idx === currentDay - 1;
        const isPast = idx < currentDay - 1;
        const bg = isToday ? color : isPast ? '#FFF' : '#2A2A2E';
        const br = shape === 'CIRCLE' ? dotSz / 2 : shape === 'ROUNDED' ? dotSz * 0.25 : 0;
        rowDots.push(<View key={idx} style={{ width: dotSz, height: dotSz, backgroundColor: bg, borderRadius: br, marginRight: c < cols - 1 ? gap : 0 }} />);
      }
      rows.push(<View key={r} style={{ flexDirection: 'row', marginBottom: gap }}>{rowDots}</View>);
    }
    return <View style={{ alignItems: 'center' }}>{rows}</View>;
  }, [totalDays, currentDay, color, shape, size, cols]);

  const getFontStyle = () => {
    const f = FONTS.find(x => x.id === font);
    return f?.family ? { fontFamily: f.family } : { fontWeight: f?.weight || '300' };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />

      {/* Splash Screen */}
      {isLoading && (
        <Animated.View style={[styles.splashContainer, { opacity: splashOpacity }]}>
          <View style={styles.splashContent}>
            <View style={styles.splashDotsContainer}>
              {Array.from({ length: 3 }).map((_, rowIdx) => (
                <View key={rowIdx} style={{ flexDirection: 'row', marginBottom: 8 }}>
                  {Array.from({ length: 5 }).map((_, colIdx) => {
                    const idx = rowIdx * 5 + colIdx;
                    const isFilled = idx < 7;
                    return (
                      <Animated.View
                        key={colIdx}
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: isFilled ? (idx === 6 ? '#4ADE80' : '#fff') : '#333',
                          marginRight: colIdx < 4 ? 8 : 0,
                        }}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
            <Text style={styles.splashTitle}>Year Dots</Text>
            <Text style={styles.splashSubtitle}>Visualize your year</Text>
          </View>
        </Animated.View>
      )}

      {/* Onboarding Screen */}
      {!isLoading && showOnboarding && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}

      {/* Main App */}
      {!isLoading && !showOnboarding && (
        <Animated.View style={[styles.full, { opacity: mainAppOpacity.interpolate ? mainAppOpacity : fadeAnim }]}>
          <View style={styles.preview} {...panResponder.panHandlers}>
            <View style={[styles.gridWrap, { transform: [{ translateX: gridOffset.x }, { translateY: gridOffset.y }] }]}>
              {DotGrid}
              {showStats && (
                <View style={[styles.stats, { opacity: textOpacity }]}>
                  <Text style={[styles.statText, getFontStyle(), { fontSize: 15 * textSize }]}>
                    <Text style={{ color: '#fff' }}>{daysLeft}</Text>
                    <Text style={{ color: '#555' }}> days left  •  </Text>
                    <Text style={{ color: '#fff' }}>{percent}%</Text>
                  </Text>
                  {showYear && <Text style={[styles.yearText, getFontStyle(), { fontSize: 13 * textSize }]}>{time.getFullYear()}</Text>}
                  {customText !== '' && <Text style={[styles.customText, getFontStyle(), { fontSize: 14 * textSize }]}>{customText}</Text>}
                </View>
              )}
            </View>

            {(gridOffset.x !== 0 || gridOffset.y !== 0) && (
              <TouchableOpacity style={styles.resetBtn} onPress={resetGrid}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            )}
            <View style={styles.hintBadge}><Text style={styles.hintText}>Drag to position</Text></View>
          </View>

          <View style={styles.bottomBtns}>
            <TouchableOpacity style={styles.editBtn} onPress={openModal} activeOpacity={0.8}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.applyBtn, { backgroundColor: color }]} onPress={handleSetWallpaper} activeOpacity={0.85}>
              <Text style={styles.applyText}>Set Wallpaper</Text>
            </TouchableOpacity>
          </View>

          <Modal visible={modalOpen} transparent animationType="none">
            <View style={styles.modalWrap}>
              <Pressable style={styles.backdrop} onPress={closeModal} />
              <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.handle} />
                <View style={styles.header}>
                  <Text style={styles.title}>Customize</Text>
                  <TouchableOpacity onPress={closeModal}><Text style={[styles.done, { color }]}>Done</Text></TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>

                  <Text style={styles.label}>Color</Text>
                  <View style={styles.colorRow}>
                    {COLORS.map(c => (
                      <Pressable key={c} onPress={() => { Vibration.vibrate(5); setColor(c); }} style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorSel]}>
                        {color === c && <View style={styles.check} />}
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.label}>Layout</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                    {GRID_LAYOUTS.map(g => (
                      <Pressable key={g.id} onPress={() => { Vibration.vibrate(5); setGridLayout(g.id); }} style={[styles.layoutBtn, gridLayout === g.id && { backgroundColor: '#333', borderColor: color }]}>
                        <Text style={[styles.layoutText, gridLayout === g.id && { color: '#fff' }]}>{g.label}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <Text style={styles.label}>Font</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                    {FONTS.map(f => (
                      <Pressable key={f.id} onPress={() => { Vibration.vibrate(5); setFont(f.id); }} style={[styles.fontBtn, font === f.id && { backgroundColor: '#333', borderColor: color }]}>
                        <Text style={[styles.fontText, { fontWeight: f.weight, fontFamily: f.family }, font === f.id && { color: '#fff' }]}>{f.label}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <Text style={styles.label}>Text Size</Text>
                  <View style={styles.row}>
                    {TEXT_SIZES.map(t => (
                      <Pressable key={t.id} onPress={() => { Vibration.vibrate(5); setTextSizeId(t.id); }} style={[styles.sizeBtn, textSizeId === t.id && { backgroundColor: '#333', borderColor: color }]}>
                        <Text style={[styles.btnText, textSizeId === t.id && { color: '#fff' }]}>{t.label}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.label}>Opacity</Text>
                  <View style={styles.row}>
                    {OPACITIES.map(o => (
                      <Pressable key={o.id} onPress={() => { Vibration.vibrate(5); setOpacityId(o.id); }} style={[styles.btn, opacityId === o.id && { backgroundColor: '#333', borderColor: color }]}>
                        <Text style={[styles.btnText, opacityId === o.id && { color: '#fff' }]}>{o.label}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.label}>Custom Text</Text>
                  <TextInput style={styles.input} placeholder="Your goal or mantra..." placeholderTextColor="#555" value={customText} onChangeText={setCustomText} maxLength={50} />

                  <Text style={styles.label}>Dot Style</Text>
                  <View style={styles.row}>
                    {SHAPES.map(s => (
                      <Pressable key={s} onPress={() => { Vibration.vibrate(5); setShape(s); }} style={[styles.btn, shape === s && { backgroundColor: '#333', borderColor: color }]}>
                        <Text style={[styles.btnText, shape === s && { color: '#fff' }]}>{s[0] + s.slice(1).toLowerCase()}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.label}>Dot Size</Text>
                  <View style={styles.row}>
                    {SIZES.map(s => (
                      <Pressable key={s} onPress={() => { Vibration.vibrate(5); setSize(s); }} style={[styles.btn, size === s && { backgroundColor: '#333', borderColor: color }]}>
                        <Text style={[styles.btnText, size === s && { color: '#fff' }]}>{s[0] + s.slice(1).toLowerCase()}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.label}>Display</Text>
                  <View style={styles.toggleCard}>
                    <View style={styles.toggleRow}>
                      <Text style={styles.toggleLabel}>Show Stats</Text>
                      <Switch value={showStats} onValueChange={setShowStats} trackColor={{ false: '#333', true: color + '80' }} thumbColor={showStats ? color : '#666'} />
                    </View>
                    <View style={styles.div} />
                    <View style={styles.toggleRow}>
                      <Text style={styles.toggleLabel}>Show Year</Text>
                      <Switch value={showYear} onValueChange={setShowYear} trackColor={{ false: '#333', true: color + '80' }} thumbColor={showYear ? color : '#666'} />
                    </View>
                  </View>
                </ScrollView>
              </Animated.View>
            </View>
          </Modal>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  full: { flex: 1 },
  // Splash Screen Styles
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  splashContent: {
    alignItems: 'center',
  },
  splashDotsContainer: {
    marginBottom: 32,
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  splashSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  // Main App Styles
  preview: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: StatusBar.currentHeight || 40, paddingBottom: 100 },
  gridWrap: { alignItems: 'center' },
  stats: { alignItems: 'center', marginTop: 28 },
  statText: { fontSize: 15 },
  yearText: { color: '#444', marginTop: 6 },
  customText: { color: '#888', marginTop: 10, fontStyle: 'italic' },
  resetBtn: { position: 'absolute', top: StatusBar.currentHeight + 10, right: 16, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  resetText: { color: '#fff', fontSize: 13 },
  hintBadge: { position: 'absolute', top: StatusBar.currentHeight + 10, left: 16, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  hintText: { color: '#666', fontSize: 11 },
  bottomBtns: { position: 'absolute', bottom: 30, left: 20, right: 20, flexDirection: 'row', gap: 12 },
  editBtn: { flex: 0.35, paddingVertical: 15, borderRadius: 14, borderWidth: 1.5, borderColor: '#333', backgroundColor: '#1a1a1a', alignItems: 'center' },
  editText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  applyBtn: { flex: 0.65, paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  applyText: { fontSize: 16, fontWeight: '700', color: '#000' },
  modalWrap: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { backgroundColor: '#111', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 10, maxHeight: SH * 0.65 },
  handle: { width: 36, height: 4, backgroundColor: '#444', borderRadius: 2, alignSelf: 'center', marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '700', color: '#fff' },
  done: { fontSize: 15, fontWeight: '600' },
  label: { fontSize: 10, fontWeight: '700', color: '#555', marginTop: 14, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorDot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  colorSel: { borderWidth: 2, borderColor: '#fff' },
  check: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#000' },
  row: { flexDirection: 'row', gap: 6 },
  btn: { flex: 1, paddingVertical: 11, borderRadius: 10, backgroundColor: '#1a1a1a', alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  sizeBtn: { paddingVertical: 11, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#1a1a1a', alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  btnText: { fontSize: 13, color: '#666', fontWeight: '600' },
  layoutBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#1a1a1a', borderWidth: 1.5, borderColor: 'transparent' },
  layoutText: { fontSize: 12, color: '#666', fontWeight: '600' },
  fontBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#1a1a1a', borderWidth: 1.5, borderColor: 'transparent' },
  fontText: { fontSize: 13, color: '#666' },
  input: { backgroundColor: '#1a1a1a', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#fff', borderWidth: 1, borderColor: '#333' },
  toggleCard: { backgroundColor: '#1a1a1a', borderRadius: 12 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 14 },
  toggleLabel: { fontSize: 14, color: '#fff', fontWeight: '500' },
  div: { height: 1, backgroundColor: '#2a2a2a', marginHorizontal: 14 },
});