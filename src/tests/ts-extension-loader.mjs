
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (specifier.startsWith(".") && !/\.[a-zA-Z0-9]+$/.test(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }
    throw err;
  }
}
