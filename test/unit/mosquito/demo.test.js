import { mount } from '@vue/test-utils';
import demo from '@/examples/mosquito/demos/base.vue';

// unit test for component in examples.
describe('Mosquito', () => {
  it('base demo works fine', () => {
    const wrapper = mount(demo);
    expect(wrapper.element).toMatchSnapshot();
  });
});
