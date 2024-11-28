import { WorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';

describe('worktimeslot 테스트', () => {
  test('getHourMinuteListGap30 테스트', () => {
    const tSlot = new WorkTimeSlot('8:30', '11:00');

    expect(tSlot.getHourMinuteListGap30().length).toEqual(6);
  });

  test('isContainPoint 테스트', () => {
    const tSlot = new WorkTimeSlot('8:30', '11:00');

    expect(tSlot.isContainPoint(tSlot.getStartHourMinute())).toBeTruthy();

    expect(tSlot.isContainPoint(tSlot.getEndHourMinute())).toBeTruthy();
  });
});
