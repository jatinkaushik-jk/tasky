import { Icon, NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";
import { useColorScheme } from "react-native";

import { Colors } from "@/constants/theme";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? "light"];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.accent}
      labelStyle={{ selected: { color: colors.accent } }}
    >
      <NativeTabs.Trigger name="today">
        {/* <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/home.png")}
          renderingMode="template"
        /> */}
        <Icon
          src={require("@/assets/images/tabIcons/home.png")}
          selectedColor={"white"}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="all">
        {/* <NativeTabs.Trigger.Label>All Tasks</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/explore.png")}
          renderingMode="template"
        /> */}
        <Icon
          src={require("@/assets/images/tabIcons/explore.png")}
          selectedColor={"white"}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
