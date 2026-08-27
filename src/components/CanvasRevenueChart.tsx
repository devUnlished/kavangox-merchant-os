import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../theme/colors';

interface CanvasRevenueChartProps {
  data: { label: string; amount: number }[];
  height?: number;
  title?: string;
  currencyPrefix?: string;
}

export const CanvasRevenueChart: React.FC<CanvasRevenueChartProps> = ({
  data,
  height = 180,
  title = '7-Day Revenue Progression (NAD)',
  currencyPrefix = 'N$',
}) => {
  const [containerWidth, setContainerWidth] = useState<number>(340);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: layoutWidth } = e.nativeEvent.layout;
    if (layoutWidth > 50) {
      setContainerWidth(layoutWidth);
    }
  };

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.noDataText}>No revenue data recorded yet.</Text>
      </View>
    );
  }

  const paddingLeft = 35;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = Math.max(containerWidth - paddingLeft - paddingRight, 100);
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map((d) => d.amount), 500);
  const minVal = 0;

  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.amount - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, amount: d.amount, label: d.label };
  });

  const linePath = points.reduce((acc, pt, index) => {
    if (index === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[index - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  const totalSum = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.totalValue}>
            {currencyPrefix}
            {totalSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>+18.4% vs last week</Text>
        </View>
      </View>

      <Svg width="100%" height={height} viewBox={`0 0 ${containerWidth} ${height}`}>
        <Defs>
          <LinearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.primaryLight} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={COLORS.primaryLight} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = paddingTop + chartHeight * ratio;
          const gridVal = Math.round(maxVal * (1 - ratio));
          return (
            <React.Fragment key={idx}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={containerWidth - paddingRight}
                y2={y}
                stroke={COLORS.borderDark}
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <SvgText
                x={paddingLeft - 6}
                y={y + 4}
                fill={COLORS.textMuted}
                fontSize={10}
                textAnchor="end"
              >
                {gridVal >= 1000 ? `${(gridVal / 1000).toFixed(1)}k` : gridVal}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Gradient fill */}
        <Path d={areaPath} fill="url(#chartGradient)" />

        {/* Line Curve */}
        <Path d={linePath} fill="none" stroke={COLORS.primaryLight} strokeWidth={2.5} />

        {/* Data points & X labels */}
        {points.map((pt, idx) => (
          <React.Fragment key={idx}>
            <Circle cx={pt.x} cy={pt.y} r={4} fill={COLORS.white} stroke={COLORS.primary} strokeWidth={2} />
            <SvgText
              x={pt.x}
              y={height - 8}
              fill={COLORS.textMuted}
              fontSize={10}
              textAnchor="middle"
              fontWeight="600"
            >
              {pt.label}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textLight,
    marginTop: 2,
  },
  badge: {
    backgroundColor: COLORS.successMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  noDataText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
});
