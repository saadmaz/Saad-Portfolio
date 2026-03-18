import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'date';
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
}

interface AdminEntityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: readonly FieldConfig[];
  schema: z.ZodObject<any>;
  defaultValues?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

const AdminEntityDialog = ({
  isOpen,
  onClose,
  title,
  fields,
  schema,
  defaultValues,
  onSubmit,
  isLoading
}: AdminEntityDialogProps) => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {},
  });

  // Reset form when defaultValues change or dialog opens
  React.useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues || {});
    }
  }, [isOpen, defaultValues, form]);

  const handleSubmit = async (data: any) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#0A0A0B] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            {fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">{field.label}</FormLabel>
                    <FormControl>
                      {field.type === 'textarea' ? (
                        <Textarea 
                          {...formField} 
                          placeholder={field.placeholder}
                          className="bg-white/5 border-white/10 focus:border-accent/50 min-h-[100px]"
                        />
                      ) : field.type === 'select' ? (
                        <Select 
                          onValueChange={formField.onChange} 
                          defaultValue={formField.value}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 focus:border-accent/50">
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0A0A0B] border-white/10 text-white">
                            {field.options?.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input 
                          {...formField} 
                          type={field.type}
                          placeholder={field.placeholder}
                          className="bg-white/5 border-white/10 focus:border-accent/50"
                          // For number inputs, ensure value is treated as a number
                          onChange={(e) => {
                            const val = field.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                            formField.onChange(val);
                          }}
                        />
                      )}
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            ))}
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose}
                className="hover:bg-white/5 text-white/70"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-accent hover:bg-accent/90 text-black font-bold px-8"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminEntityDialog;
