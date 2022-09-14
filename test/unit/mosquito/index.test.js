import { mount } from '@vue/test-utils';
import Mosquito from '@/src/mosquito/index.ts';

// every component needs four parts: props/events/slots/functions.
describe('Mosquito', () => {
  // test props api
  describe(':props', () => {
    it('', () => {
      const wrapper = mount({
        render() {
          return <Mosquito></Mosquito>;
        },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });

  // test events
  describe('@event', () => {});

  // test slots
  describe('<slot>', () => {
    it('', () => {});
  });

  // test exposure function
  describe('function', () => {
    it('', () => {});
  });
});
