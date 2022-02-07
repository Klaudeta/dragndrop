export function Autobind(
  target: any,
  methodName: String,
  propertyDescriptor: PropertyDescriptor
) {
  const originalMethod = propertyDescriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}
