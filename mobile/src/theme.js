// Paleta e estilos compartilhados para manter a interface visualmente consistente.
import { StyleSheet } from 'react-native';

const C = {
  ink: '#16342D',
  muted: '#63766E',
  green: '#256B50',
  lime: '#C7E86C',
  paper: '#F5F7F0',
  white: '#FFFFFF',
  line: '#DCE5D8',
  orange: '#C97935',
  red: '#A33D30'
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.paper
  },
  page: {
    padding: 22,
    paddingBottom: 44,
    gap: 14
  },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22
  },
  brandGlyph: {
    fontSize: 32,
    color: C.lime
  },
  eyebrow: {
    color: C.green,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginTop: 9
  },
  h1: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: C.ink,
    letterSpacing: -.7
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: C.muted
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 20,
    color: C.muted
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: C.line,
    gap: 12,
    marginTop: 4
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: C.ink
  },
  btn: {
    backgroundColor: C.green,
    minHeight: 50,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: C.green
  },
  btnSmall: {
    minHeight: 38,
    paddingHorizontal: 12
  },
  btnText: {
    fontSize: 15,
    fontWeight: '800',
    color: C.white
  },
  btnTextOutline: {
    color: C.green
  },
  field: {
    gap: 6
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: C.ink
  },
  optional: {
    fontWeight: '400',
    color: '#94A39B',
    fontSize: 11
  },
  input: {
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: '#FBFCF8',
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: C.ink,
    minHeight: 45
  },
  link: {
    color: C.green,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    padding: 10
  },
  helper: {
    fontSize: 11,
    lineHeight: 16,
    color: C.muted
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 18,
    color: C.muted,
    textAlign: 'center',
    marginTop: 8
  },
  hero: {
    backgroundColor: C.ink,
    borderRadius: 22,
    padding: 19,
    gap: 12,
    marginVertical: 7
  },
  heroTag: {
    color: C.lime,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5
  },
  heroTitle: {
    color: C.white,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '800'
  },
  heroText: {
    color: '#D9E7DE',
    fontSize: 14,
    lineHeight: 21
  },
  section: {
    fontSize: 18,
    fontWeight: '800',
    color: C.ink,
    marginTop: 7
  },
  navAction: {
    color: C.green,
    fontWeight: '800',
    fontSize: 14,
    padding: 8
  },
  metrics: {
    gap: 9
  },
  metric: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line
  },
  metricLabel: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '600'
  },
  metricValue: {
    fontSize: 21,
    color: C.ink,
    fontWeight: '800',
    marginTop: 3
  },
  chart: {
    marginTop: 12
  },
  axis: {
    fontSize: 10,
    color: C.muted
  },
  barRow: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: C.line,
    marginVertical: 5
  },
  barSlot: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    flex: 1
  },
  bar: {
    width: 9,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4
  },
  barLabel: {
    fontSize: 9,
    color: C.muted,
    marginTop: 3
  },
  parameter: {
    borderTopWidth: 1,
    borderColor: C.line,
    paddingTop: 9,
    gap: 3
  },
  parameterName: {
    fontSize: 13,
    fontWeight: '800',
    color: C.ink
  },
  notice: {
    backgroundColor: '#FFF3E6',
    padding: 13,
    borderRadius: 13
  },
  noticeText: {
    color: '#7B4B20',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700'
  },
  warning: {
    backgroundColor: '#EDF4E9',
    padding: 13,
    borderRadius: 13
  },
  warningText: {
    color: C.ink,
    fontSize: 13,
    lineHeight: 19
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    borderTopWidth: 1,
    borderColor: C.line,
    paddingTop: 10
  },
  action: {
    color: C.green,
    fontSize: 13,
    fontWeight: '800'
  },
  selected: {
    borderColor: C.green,
    borderWidth: 2
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7
  },
  pill: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.line,
    paddingVertical: 8,
    paddingHorizontal: 11
  },
  pillActive: {
    backgroundColor: C.green
  },
  pillText: {
    fontSize: 11,
    color: C.ink,
    fontWeight: '700'
  },
  pillTextActive: {
    color: C.white
  }
});

export { C, styles };
