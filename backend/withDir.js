const withDir = (path, toRun) => {
  const goBack = process.chdir.bind(null, process.cwd);
  process.chdir(path);
  try {
    toRun();
  } catch (e) {
    goBack();
    throw e;
  }
  goBack();
};

module.export = withDir;
