'use client'

import React, { useState, useMemo, FormEvent, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from 'lucide-react'
import { CiMenuKebab } from "react-icons/ci";
import { RiFileExcel2Line } from "react-icons/ri";
import { FiPlus } from "react-icons/fi";
import * as XLSX from 'xlsx';
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { customerSchema } from "@/lib/customerSchema";
import { CardSchema } from '@/lib/cardSchema'
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogFooter
} from "@/components/ui/dialog"

import { FaRegCreditCard } from "react-icons/fa6";

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { Calendar } from "@/components/ui/calendar"




interface Customer {
    id: number;
    name: string;
    lastname?: string;
    email: string;
    birthDate: Date;
    phone: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
    cards: Card[];
}

interface Card {
    id: number;
    number: string;
    valiDate: Date;
    cvv: string;
}


type CustomerFormValues = z.infer<typeof customerSchema>;
type CardFormValues = z.infer<typeof CardSchema>;


export default function MainTable() {
    const { toast } = useToast()

    const { data: session } = useSession();
    const [dados, setDados] = useState<Customer[]>([]);
    const [jsonData, setJsonData] = useState<any[]>([]);
    const [pesquisa, setPesquisa] = useState("")
    const [filtroNome, setFiltroNome] = useState("")
    const [filtroCategoria, setFiltroCategoria] = useState("")
    const [ordenacao, setOrdenacao] = useState<{ coluna: keyof Customer; direcao: 'asc' | 'desc' }>({ coluna: 'name', direcao: 'asc' })
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [date, setDate] = React.useState<Date>()


    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
    });

    const {
        register: registerCard,
        handleSubmit: handleSubmitCard,
        reset: resetCard,
        setValue: setValueCard,
        formState: { errors: cardErrors },
    } = useForm<CardFormValues>({
        resolver: zodResolver(CardSchema),
    });

    const [cepError, setCepError] = useState("");

    const onSubmit = async (data: CustomerFormValues) => {
        if (!session || !session.user?.email) {
            console.error('Usuário não autenticado ou e-mail não encontrado.');
            return;
        }

        try {
            customerSchema.parse(data); // Valida os dados com o Zod

            const response = await fetch(`/api/customers?userEmail=${session?.user?.email}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    lastname: data.lastname,
                    email: data.email,
                    birthdate: data.birthDate,
                    phone: data.phone,
                    address: data.address,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao adicionar o cliente: ${errorData.error || response.statusText}`);
            }

            setDialogOpen(false)
            fetchData();
            reset();
            toast({
                variant: "success",
                title: "Cliente adicionado com sucesso!",
                description: "O cliente foi adicionado com sucesso.",
            })

            console.log('Cliente adicionado com sucesso!', response)


        } catch (error) {
            console.error('Erro ao adicionar o cliente:', error);
        }
    };

    const onSubmitCard = (data: CardFormValues) => {
        console.log("Dados do cartão:", data);
        // Lógica para lidar com os dados do cartão
    };

    useEffect(() => {
        if (session?.user?.email) {
            fetchData();
        }
    }, [session]);

    const fetchAddress = async (cep: string) => {

        if (cep.length !== 9) {
            toast({
                variant: "destructive",
                title: "Ops, algo deu errado!",
                description: "Por favor, digite um CEP com 9 caracteres.",

            })
            return;
        }

        try {
            setCepError("");
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

            if (!response.ok) {
                console.log("CEP não encontrado.");
                setCepError("CEP não encontrado.");
                return;
            }

            const data = await response.json();

            if (data.erro) {
                toast({
                    variant: "destructive",
                    title: "Ops, algo deu errado!",
                    description: "CEP não encontrado.",

                })
                return;
            }

            setValue("address", `${data.logradouro}, ${data.bairro} - ${data.localidade} - ${data.uf} - CEP: ${data.cep}`);
            toast({
                variant: "success",
                title: "Agora foi!",
                description: "CEP encontrado com sucesso!.",

            })
        } catch (error) {
            console.log("Erro ao buscar o CEP.", error);
            setCepError("Erro ao buscar o CEP.");
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/customers?email=${session?.user?.email}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            const fetchedCustomers = data.map((cliente: any) => ({
                id: cliente.id,
                name: cliente.name,
                lastname: cliente.lastname,
                email: cliente.email,
                birthDate: cliente.birthdate,
                address: cliente.address,
                phone: cliente.phone,
            }));
            setDados(fetchedCustomers);
            // console.log('Dados trazidos do servidor:', fetchedCustomers);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const dadosFiltrados = useMemo(() => {
        return dados
            .filter(cliente =>
                (pesquisa === "" || (
                    (cliente.name && cliente.name.toLowerCase().includes(pesquisa.toLowerCase())) ||
                    (cliente.lastname && cliente.lastname.toLowerCase().includes(pesquisa.toLowerCase())) ||
                    (cliente.email && cliente.email.toLowerCase().includes(pesquisa.toLowerCase()))
                )) &&
                (filtroNome === "" || (cliente.name && cliente.name === filtroNome)) &&
                (filtroCategoria === "" || (cliente.address && cliente.address.includes(filtroCategoria)))
            )
            .sort((a, b) => {
                if (ordenacao.coluna === 'birthDate') {
                    return ordenacao.direcao === 'asc'
                        ? new Date(a.birthDate || 0).getTime() - new Date(b.birthDate || 0).getTime()
                        : new Date(b.birthDate || 0).getTime() - new Date(a.birthDate || 0).getTime();
                }
                if (ordenacao.coluna === 'name' || ordenacao.coluna === 'lastname' || ordenacao.coluna === 'email') {
                    return ordenacao.direcao === 'asc'
                        ? (a[ordenacao.coluna] || "").localeCompare(b[ordenacao.coluna] || "")
                        : (b[ordenacao.coluna] || "").localeCompare(a[ordenacao.coluna] || "");
                }
                return 0;
            });
    }, [pesquisa, filtroNome, filtroCategoria, ordenacao, dados]);

    const toggleOrdenacao = (coluna: keyof Customer) => {
        setOrdenacao(prev => ({
            coluna,
            direcao: prev.coluna === coluna && prev.direcao === 'asc' ? 'desc' : 'asc'
        }))
    }


    const nomes = ["Todos", ...Array.from(new Set(dados.map(cliente => cliente.name)))];



    return (
        <div className="space-y-4 min-w-[1500px] pt-10 w-full">
            <div className='max-w-[1500px] mx-auto px-4 py-8'>
                <div className='pb-4'>
                    <h1 className="text-3xl font-bold">Clientes Cadastrados</h1>
                </div>
                <div className='flex gap-2 items-center'>
                    <Input
                        placeholder="Pesquisar..."
                        value={pesquisa}
                        onChange={(e) => setPesquisa(e.target.value)}
                        className='max-w-[600px]'
                    />
                    <div className="flex space-x-2">
                        <Select value={filtroNome} onValueChange={value => setFiltroNome(value === "Todos" ? "" : value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrar por nome" />
                            </SelectTrigger>
                            <SelectContent>
                                {nomes.map(nome => (
                                    <SelectItem key={nome} value={nome}>{nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>


                        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger className='bg-black flex items-center justify-center text-[14px] text-white font-semibold min-w-[100px]  px-4 py-2 rounded-md '>Adicionar Cliente <FiPlus className='ml-2' /></DialogTrigger>
                            <DialogContent className='min-w-[900px] min-h-[400px]'>
                                <DialogHeader>
                                    <DialogTitle className='text-[20px] font-bold pb-4'>Deseja Adicionar um novo Cliente?</DialogTitle>
                                    <DialogDescription>
                                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="name" className="block font-medium text-gray-700">
                                                        Nome
                                                    </label>
                                                    <Input
                                                        id="name"
                                                        placeholder="Digite o nome do Cliente"
                                                        type="text"
                                                        {...register("name")}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                                                </div>
                                                <div>
                                                    <label htmlFor="lastname" className="block font-medium text-gray-700">
                                                        Sobrenome
                                                    </label>
                                                    <Input
                                                        id="lastname"
                                                        placeholder="Digite o sobrenome do Cliente"
                                                        type="text"
                                                        {...register("lastname")}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                    {errors.lastname && <p className="text-red-500">{errors.lastname.message}</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <div className=''>
                                                    <label htmlFor="email" className="block font-medium text-gray-700">
                                                        Email
                                                    </label>
                                                    <Input
                                                        id="email"
                                                        placeholder="Digite o e-mail do Cliente"
                                                        type="text"
                                                        {...register("email")}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                    {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                                                </div>
                                            </div>

                                            <div className='grid grid-cols-2 gap-4'>
                                                <div>
                                                    <label htmlFor="email" className="block font-medium text-gray-700">
                                                        CEP
                                                    </label>
                                                    <div>
                                                        <Input
                                                            id="cep"
                                                            placeholder="Digite o CEP do cliente"
                                                            type="text"
                                                            {...register("cep")}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        />
                                                        {errors.cep && <p className="text-red-500">{errors.cep.message}</p>}
                                                        <div className='flex justify-end'>
                                                            <label
                                                                htmlFor="cep"
                                                                className="text-blue-500 underline mt-1 cursor-pointer block"
                                                                onClick={(e) => fetchAddress((document.getElementById('cep') as HTMLInputElement).value)} // Acionando a função ao clicar
                                                            >
                                                                Buscar CEP
                                                            </label>
                                                        </div>
                                                    </div>

                                                </div>
                                                <div>
                                                    <label htmlFor="address" className="block font-medium text-gray-700">
                                                        Endereço
                                                    </label>
                                                    <Input
                                                        id="address"
                                                        placeholder="Digite o endereço do Cliente"
                                                        type="text"
                                                        readOnly

                                                        {...register("address")}
                                                        className="mt-1 block w-full cursor-not-allowed rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                    {errors.address && <p className="text-red-500">{errors.address.message}</p>}
                                                </div>
                                            </div>

                                            <div className='grid grid-cols-2 gap-4'>
                                                <div>
                                                    <label htmlFor="phone" className="block font-medium text-gray-700">
                                                        Telefone
                                                    </label>
                                                    <Input
                                                        id="phone"
                                                        placeholder="Digite o telefone do Cliente"
                                                        type="text"
                                                        {...register("phone")}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                    {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
                                                </div>
                                                <div>
                                                    <label htmlFor="birthDate" className="block font-medium text-gray-700">
                                                        Data de Nascimento
                                                    </label>
                                                    <Input
                                                        id="birthDate"
                                                        type="date"
                                                        {...register("birthDate", { valueAsDate: true })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                    {errors.birthDate && (
                                                        <p className="text-red-500">{errors.birthDate.message}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-md shadow-sm hover:bg-indigo-600"
                                            >
                                                Adicionar Cliente
                                            </button>
                                        </form>

                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                {isLoading ? (
                    <p>Careggando...</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => toggleOrdenacao('name')}>
                                        Nome <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => toggleOrdenacao('email')}>
                                        email <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => toggleOrdenacao('birthDate')}>
                                        Data de Nascimento <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => toggleOrdenacao('address')}>
                                        Endereço <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => toggleOrdenacao('phone')}>
                                        Telefone <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" >
                                        Cartões
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost">
                                        Ações
                                    </Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dadosFiltrados.map((cliente, index) => (
                                <TableRow key={index}>
                                    <TableCell>{cliente.name}</TableCell>
                                    <TableCell>{cliente.email}</TableCell>
                                    <TableCell>
                                        {cliente.birthDate ? new Date(cliente.birthDate).toLocaleDateString() : "N/A"}
                                    </TableCell>
                                    <TableCell>{cliente.address}</TableCell>
                                    <TableCell>{cliente.phone}</TableCell>
                                    <TableCell>
                                        {cliente.cards && Array.isArray(cliente.cards) && cliente.cards.length > 0 ? (
                                            <ul>
                                                {cliente.cards.map((card) => (
                                                    <li key={card.id}>
                                                        {`Número: ${card.number}, Validade: ${card.valiDate}`}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            "Nenhum cartão cadastrado"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Popover>
                                            <PopoverTrigger>
                                                <CiMenuKebab />
                                            </PopoverTrigger>
                                            <PopoverContent className="flex flex-col gap-2 max-w-[200px]">

                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            className='bg-blue-500 hover:bg-blue-600 text-white hover-text-white px-4 py-2 rounded'
                                                            variant="outline">Adicionar Cartão <FaRegCreditCard /></Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="">
                                                        <DialogHeader>
                                                            <DialogTitle>Adicionar um novo cartão ao cliente?<span className='underline'>{cliente.name}</span></DialogTitle>
                                                            <DialogDescription>
                                                                Anyone who has this link will be able to view this.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div>

                                                            <form onSubmit={handleSubmitCard(onSubmitCard)}>
                                                                <div className='grid grid-cols-2 gap-4'>
                                                                    <div>
                                                                        <Label>Insira o número do cartão</Label>
                                                                        <Input
                                                                            {...registerCard("number")}
                                                                            placeholder="Número do Cartão" />
                                                                        {cardErrors.number && <p>{cardErrors.number.message}</p>}
                                                                    </div>
                                                                    <div>
                                                                        <Label>Insira a Data de Validade</Label>
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    variant={"outline"}
                                                                                    className={cn(
                                                                                        "w-[280px] justify-start text-left font-normal",
                                                                                        !date && "text-muted-foreground"
                                                                                    )}
                                                                                >
                                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-auto p-0">
                                                                                <Calendar
                                                                                    mode="single"
                                                                                    selected={date}
                                                                                    onSelect={setDate}
                                                                                    initialFocus
                                                                                    views={['year', 'month']}
                                                                                />
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </div>
                                                                </div>
                                                                <div className='max-w-[200px]'>
                                                                    <Label>Insira o código de segurança</Label>
                                                                    <Input
                                                                        {...registerCard("cvv")}
                                                                        placeholder="CVV" />
                                                                    {cardErrors.cvv && <p>{cardErrors.cvv.message}</p>}
                                                                </div>

                                                                <div className='flex justify-end mt-4'>
                                                                    <Button
                                                                        type="submit"
                                                                        className='bg-blue-500 hover:bg-blue-600 text-white hover-text-white px-4 py-2 rounded'>Adicionar Cartão</Button>
                                                                </div>
                                                            </form>
                                                        </div>

                                                    </DialogContent>
                                                </Dialog>

                                                <Button>Atualizar</Button>
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

            </div>
        </div>
    )
}

