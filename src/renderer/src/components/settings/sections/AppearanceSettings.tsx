import { AppearanceTheme } from '@common/settings/types';
import { useSettings } from '@renderer/contexts/settings/SettingsContext';
import { Label } from '@renderer/shadcn/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renderer/shadcn/ui/select';

export function AppearanceSettings() {
  const { settings, updateSettings } = useSettings();

  const handleThemeChange = (theme: AppearanceTheme) => {
    updateSettings({
      appearance: {
        ...settings.appearance,
        theme,
      },
    });
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="theme">Theme</Label>
        <Select value={settings.appearance.theme} onValueChange={handleThemeChange}>
          <SelectTrigger id="theme">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Select your preferred theme or sync with system settings.
        </p>
      </div>
    </div>
  );
}
