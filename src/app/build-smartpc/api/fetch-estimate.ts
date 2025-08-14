export const fetchEstimate = async ({
  methods,
  getEstimate,
  toast,
  showError = true,
}: any) => {
  const { trigger, getValues } = methods;

  const isValid = await trigger();
  if (!isValid) return;

  const values = getValues();

  try {
    await getEstimate({
      configId: values.cpu,
      storageSize: values.storage,
      region: values.region,
    }).unwrap();
  } catch (err) {
    console.error("Estimate error:", err);
    if (showError && toast) {
      toast({
        title: "Error",
        description: "Failed to fetch estimate",
        variant: "destructive",
      });
    }
  }
};
